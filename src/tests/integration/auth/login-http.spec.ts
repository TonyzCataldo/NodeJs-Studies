import request from "supertest";
import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { buildApp } from "../../../infra/http/app";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

let app: ReturnType<typeof buildApp>;

async function truncateAllTablesExceptMigrations() {
  await app.prisma.$executeRawUnsafe(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname='public'
          AND tablename <> '_prisma_migrations'
      ) LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
      END LOOP;
    END $$;
  `);
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

describe("POST /auth/login (integration)", () => {
  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  }, 30_000);

  beforeEach(async () => {
    await truncateAllTablesExceptMigrations();
    await app.redis.flushDb();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should login (200), return accessToken/refreshToken in body, and persist refresh token hash", async () => {
    // arrange: user no DB com bcrypt hash real (mesmo cost do provider = 6)
    const plainPassword = "123456";
    const password_hash = await bcrypt.hash(plainPassword, 6);

    const user = await app.prisma.user.create({
      data: {
        name: "User",
        email: "test@test.com",
        password_hash,
      },
    });

    // act
    const res = await request(app.server).post("/auth/login").send({
      email: user.email,
      password: plainPassword,
    });

    // assert http
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("no-store");

    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
    expect(res.body.accessToken.length).toBeGreaterThan(20);

    const refreshToken = res.body.refreshToken;
    expect(refreshToken).toBeTruthy();

    // assert db: refresh token foi salvo com hash sha256 do token
    const tokenHash = sha256(refreshToken);

    const stored = await app.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    expect(stored).not.toBeNull();
    expect(stored?.userId).toBe(user.id);
    expect(stored?.revokedAt).toBeNull();

    // garante que foram preenchidos
    expect(stored?.ipAddress).toBeTruthy();
    expect(stored?.sessionId).toBeTruthy();
    expect(stored?.expiresAt).toBeInstanceOf(Date);
  });

  it("should revoke previous active refresh tokens for the user (single-session) and create a new one", async () => {
    // arrange
    const plainPassword = "123456";
    const password_hash = await bcrypt.hash(plainPassword, 6);

    const user = await app.prisma.user.create({
      data: {
        name: "User",
        email: "test@test.com",
        password_hash,
      },
    });

    // cria um refresh token “ativo” antigo no DB (revokedAt = null)
    const oldRefreshPlain = "old-refresh-token";
    const oldTokenHash = sha256(oldRefreshPlain);
    const oldId = crypto.randomUUID();

    await app.prisma.refreshToken.create({
      data: {
        id: oldId,
        userId: user.id,
        tokenHash: oldTokenHash,
        sessionId: crypto.randomUUID(),
        ipAddress: "127.0.0.1",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        revokedAt: null,
        replacedByTokenId: null,
      },
    });

    // act: login de novo
    const res = await request(app.server).post("/auth/login").send({
      email: user.email,
      password: plainPassword,
    });

    expect(res.status).toBe(200);

    const newRefresh = res.body.refreshToken as string;
    const newHash = sha256(newRefresh);

    const newStored = await app.prisma.refreshToken.findUnique({
      where: { tokenHash: newHash },
    });
    expect(newStored).not.toBeNull();

    // assert: antigo foi revogado e apontou pro novo
    const oldStored = await app.prisma.refreshToken.findUnique({
      where: { tokenHash: oldTokenHash },
    });

    expect(oldStored).not.toBeNull();
    expect(oldStored?.revokedAt).not.toBeNull();
    expect(oldStored?.replacedByTokenId).toBe(newStored!.id);
  });

  it("should return 401 when user does not exist", async () => {
    const res = await request(app.server).post("/auth/login").send({
      email: "nope@test.com",
      password: "123456",
    });

    expect(res.status).toBe(401);
    expect(res.headers["cache-control"]).toContain("no-store");
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 when password is wrong", async () => {
    const password_hash = await bcrypt.hash("correctpass", 6);

    await app.prisma.user.create({
      data: {
        name: "User",
        email: "test@test.com",
        password_hash,
      },
    });

    const res = await request(app.server).post("/auth/login").send({
      email: "test@test.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
    expect(res.headers["cache-control"]).toContain("no-store");
    expect(res.body).toHaveProperty("message");
  });

  it("should return 400 for invalid payload (zod)", async () => {
    const res = await request(app.server).post("/auth/login").send({
      email: "invalid-email",
      password: "123", // < 6
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Validation error");
    expect(res.body).toHaveProperty("issues");
  });
});
