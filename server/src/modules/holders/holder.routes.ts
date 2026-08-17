import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { IHolderController } from "./holder.controller.js";

export class HolderRoutes {
  static async defineRoutes(fastify: FastifyInstance) {
    const holderController = container.resolve<IHolderController>(
      TOKENS.Holders.Controller,
    );
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get("/holders", holderController.getFindAll);
  }
}
