import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "../container.js";
import { HolderController } from "../controllers/holder.controller.js";

export class HolderRoutes {
  static async defineRoutes(fastify: FastifyInstance) {
    const holderController = container.resolve(HolderController);
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get("/holders", holderController.getFindAll.bind(holderController));
  }
}
