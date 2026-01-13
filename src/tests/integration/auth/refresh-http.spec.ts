import request from "supertest";
import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { buildApp } from "../../../infra/http/app";
import crypto from "node:crypto";

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

function getSetCookieHeader(res: request.Response): string[] {
  const h = res.headers["set-cookie"];
  if (!h) return [];
  return Array.isArray(h) ? h : [h];
}

describe("POST /auth/refresh (integration)", () => {
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

  it("should return 401 when refreshToken cookie is missing", async () => {
    const res = await request(app.server).post("/auth/refresh").send({});

    expect(res.status).toBe(401);
    expect(res.headers["cache-control"]).toContain("no-store");
    expect(res.body).toHaveProperty("message", "Authentication Error.");

    // retorno acontece antes do try/catch => NÃO chama clearCookie
    expect(getSetCookieHeader(res).length).toBe(0);
  });

  it("should refresh (200): return accessToken+refreshToken and rotate DB token (revoke old + create new + replacedByTokenId)", async () => {
    // arrange: user
    const user = await app.prisma.user.create({
      data: {
        name: "User",
        email: "test@test.com",
        password_hash: "x",
      },
    });

    // arrange: refresh token antigo ativo
    const oldRefreshPlain = "old-refresh-plain-token";
    const oldHash = sha256(oldRefreshPlain);
    const oldId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    await app.prisma.refreshToken.create({
      data: {
        id: oldId,
        userId: user.id,
        tokenHash: oldHash,
        sessionId,
        ipAddress: "127.0.0.1",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h futuro
        revokedAt: null,
        replacedByTokenId: null,
      },
    });

    // act
    const res = await request(app.server)
      .post("/auth/refresh")
      .set("Cookie", [`refreshToken=${oldRefreshPlain}`]);

    // assert http
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("no-store");

    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
    expect(res.body.accessToken.length).toBeGreaterThan(20);

    const newRefreshPlain = res.body.refreshToken as string;
    expect(newRefreshPlain).toBeTruthy();
    expect(newRefreshPlain).not.toBe(oldRefreshPlain);

    // assert db: token antigo revogado + aponta pro novo
    const oldStored = await app.prisma.refreshToken.findUnique({
      where: { tokenHash: oldHash },
    });

    expect(oldStored).not.toBeNull();
    expect(oldStored?.revokedAt).not.toBeNull();
    expect(oldStored?.replacedByTokenId).toBeTruthy();

    // assert db: novo token existe e bate com o refreshToken retornado
    const newHash = sha256(newRefreshPlain);

    const newStoredByHash = await app.prisma.refreshToken.findUnique({
      where: { tokenHash: newHash },
    });

    expect(newStoredByHash).not.toBeNull();
    expect(newStoredByHash?.revokedAt).toBeNull();
    expect(newStoredByHash?.userId).toBe(user.id);
    expect(newStoredByHash?.sessionId).toBe(sessionId);

    // e o antigo realmente aponta pro id do novo
    expect(oldStored?.replacedByTokenId).toBe(newStoredByHash?.id);

    // sucesso não deve limpar cookie
    expect(getSetCookieHeader(res).length).toBe(0);
  });

  it("should return 401 and clear cookie when refresh token does not exist", async () => {
    const res = await request(app.server)
      .post("/auth/refresh")
      .set("Cookie", [`refreshToken=non-existent-token`]);

    expect(res.status).toBe(401);
    expect(res.headers["cache-control"]).toContain("no-store");

    const setCookies = getSetCookieHeader(res).join(" ");
    expect(setCookies).toContain("refreshToken=");
    expect(setCookies).toContain("Path=/auth/refresh");
  });

  it("should return 401 and clear cookie when refresh token is already revoked", async () => {
    const user = await app.prisma.user.create({
      data: { name: "User", email: "test@test.com", password_hash: "x" },
    });

    const plain = "revoked-token";
    const hash = sha256(plain);

    await app.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        sessionId: crypto.randomUUID(),
        ipAddress: "127.0.0.1",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: new Date(),
        replacedByTokenId: null,
      },
    });

    const res = await request(app.server)
      .post("/auth/refresh")
      .set("Cookie", [`refreshToken=${plain}`]);

    expect(res.status).toBe(401);

    const setCookies = getSetCookieHeader(res).join(" ");
    expect(setCookies).toContain("refreshToken=");
    expect(setCookies).toContain("Path=/auth/refresh");
  });

  it("should revoke token and return 401 + clear cookie when refresh token is expired", async () => {
    const user = await app.prisma.user.create({
      data: { name: "User", email: "test@test.com", password_hash: "x" },
    });

    const plain = "expired-token";
    const hash = sha256(plain);

    const created = await app.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        sessionId: crypto.randomUUID(),
        ipAddress: "127.0.0.1",
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: null,
        replacedByTokenId: null,
      },
    });

    const res = await request(app.server)
      .post("/auth/refresh")
      .set("Cookie", [`refreshToken=${plain}`]);

    expect(res.status).toBe(401);

    const setCookies = getSetCookieHeader(res).join(" ");
    expect(setCookies).toContain("refreshToken=");
    expect(setCookies).toContain("Path=/auth/refresh");

    // valida que o use-case realmente revogou no DB
    const stored = await app.prisma.refreshToken.findUnique({
      where: { id: created.id },
    });

    expect(stored).not.toBeNull();
    expect(stored?.revokedAt).not.toBeNull();
  });
});
