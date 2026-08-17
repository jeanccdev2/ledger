import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { HolderController } from "./holder.controller.js";
import { HolderService } from "./holder.service.js";
import { HolderRepository } from "./holder.repository.js";

export class HolderRoutes {
  static async defineRoutes(fastify: FastifyInstance) {
    const holderRepository = new HolderRepository();
    const holderService = new HolderService(holderRepository);
    const holderController = new HolderController(holderService);
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get("/holders", holderController.getFindAll);
  }
}
