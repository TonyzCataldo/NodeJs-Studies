// import { createClient } from "redis";
// import { env } from "../../shared/env";
// import { PrismaClient } from "../../infra/generated/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const connectionString = `${env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });

// export const prisma = new PrismaClient({ adapter });

// export const redis = createClient({
//   url: env.REDIS_URL,
// });

// async function truncateAllTables() {
//   // Trunca todas as tabelas do schema public e reseta sequences/ids
//   await prisma.$executeRawUnsafe(`
//     DO $$
//     DECLARE
//       r RECORD;
//     BEGIN
//       -- desliga triggers/constraints de forma segura via CASCADE no truncate
//       FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
//         EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
//       END LOOP;
//     END $$;
//   `);
// }

// export async function resetInfra() {
//   await truncateAllTables();

//   // Redis: apaga tudo do DB selecionado (default 0)
//   await redis.flushDb();
// }

// export async function setupInfra() {
//   if (!redis.isOpen) {
//     await redis.connect();
//   }
// }

// export async function teardownInfra() {
//   await prisma.$disconnect();
//   if (redis.isOpen) {
//     await redis.quit();
//   }
// }
