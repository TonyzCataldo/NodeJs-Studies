import request from "supertest";
import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { buildApp } from "../../../infra/http/app";
import bcrypt from "bcryptjs";

let app: ReturnType<typeof buildApp>;

async function truncateAllTables() {
  await app.prisma.$executeRawUnsafe(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename <> '_prisma_migrations'
      ) LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
      END LOOP;
    END $$;
  `);
}

describe("POST /users (integration)", () => {
  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  beforeEach(async () => {
    await truncateAllTables();
    await app.redis.flushDb();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create user (201) and persist in DB with hashed password", async () => {
    const payload = {
      name: "user",
      email: "test@test.com",
      password: "123456",
    };

    const res = await request(app.server).post("/users").send(payload);

    expect(res.status).toBe(201);

    // controller faz send() vazio
    expect(res.text).toBe("");

    // header sempre presente no success
    expect(res.headers["cache-control"]).toContain("no-store");

    // confirma persistência real
    const userInDb = await app.prisma.user.findUnique({
      where: { email: payload.email },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb?.name).toBe(payload.name);
    expect(userInDb?.email).toBe(payload.email);

    // senha não pode estar em texto puro
    const isValidPassword = await bcrypt.compare(
      payload.password,
      userInDb!.password_hash
    );

    expect(isValidPassword).toBe(true);
  });

  it("should return 409 when email already exists", async () => {
    const payload = {
      name: "user",
      email: "dup@test.com",
      password: "123456",
    };

    // cria primeiro
    await request(app.server).post("/users").send(payload).expect(201);

    // tenta duplicar
    const res = await request(app.server).post("/users").send(payload);

    expect(res.status).toBe(409);
    expect(res.headers["cache-control"]).toContain("no-store");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");

    // garante que não criou outro usuário
    const count = await app.prisma.user.count({
      where: { email: payload.email },
    });
    expect(count).toBe(1);
  });

  it("should return 400 for invalid payload (zod validation)", async () => {
    const res = await request(app.server).post("/users").send({
      name: "",
      email: "not-an-email",
      password: "123", // < 6
    });

    expect(res.status).toBe(400);

    // seu errorHandler manda:
    // { message: "Validation error", issues: ... }
    expect(res.body).toHaveProperty("message", "Validation error");
    expect(res.body).toHaveProperty("issues");
  });
});
