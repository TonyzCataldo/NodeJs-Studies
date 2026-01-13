import { env } from "../../shared/env";
import { buildApp } from "./app";

const app = buildApp();

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`🚀 HTTP server running on http://localhost:${env.PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
