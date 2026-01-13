import { FastifyInstance } from "fastify";
import { CreateProductController } from "./products/controllers/create-product-controller";
import { GetProductController } from "./products/controllers/get-product-controller";

export async function productsRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [app.authenticate, app.authorizeRoles(["admin"])] },
    CreateProductController
  );
  app.get("/", GetProductController);
}
