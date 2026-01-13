import fp from "fastify-plugin";
import { prisma } from "./prisma"; // seu prisma singleton

export default fp(async function prismaPlugin(app) {
  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
