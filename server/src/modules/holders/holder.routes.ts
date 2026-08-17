import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { IHolderController } from "./holder.controller.js";
import { findAllHoldersQuerySchema } from "./holders.validations.js";

export class HolderRoutes {
  private static TAG = "Holders";

  static async defineRoutes(fastify: FastifyInstance) {
    const holderController = container.resolve<IHolderController>(
      TOKENS.Holders.Controller,
    );
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get("/holders", {
      schema: {
        tags: [HolderRoutes.TAG],
        querystring: findAllHoldersQuerySchema,
      },
      handler: holderController.getFindAll,
    });
  }
}
