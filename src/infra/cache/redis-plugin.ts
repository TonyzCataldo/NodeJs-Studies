import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createClient } from "redis";
import { env } from "../../shared/env";

export default fp(async function redisPlugin(app: FastifyInstance) {
  const client = createClient({
    url: env.REDIS_URL,
  });

  client.on("error", (err) => {
    app.log.error({ err }, "Redis error");
  });
  try {
    await client.connect();

    app.decorate("redis", client);
    app.log.info("Redis connected");
  } catch (err) {
    app.log.warn("Redis unavailable, running without cache");
  }
  app.addHook("onClose", async () => {
    if (client.isOpen) {
      await client.quit();
    }
  });
});
