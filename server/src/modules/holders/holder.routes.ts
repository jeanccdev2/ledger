import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { IHolderController } from "./holder.controller.js";
import {
  createHolderBodySchema,
  findAllHoldersQuerySchema,
  holderUuidParamSchema,
  updateHolderBodySchema,
} from "./holders.validations.js";
import { uuidSchema } from "../../shared/shared.validations.js";
import z from "zod";

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

    app.get("/holders/:holderUuid", {
      schema: {
        tags: [HolderRoutes.TAG],
        params: holderUuidParamSchema,
      },
      handler: holderController.getByUuid,
    });

    app.post("/holders", {
      schema: {
        tags: [HolderRoutes.TAG],
        body: createHolderBodySchema,
      },
      handler: holderController.postCreateHolder,
    });

    app.patch("/holders/:holderUuid", {
      schema: {
        tags: [HolderRoutes.TAG],
        params: holderUuidParamSchema,
        body: updateHolderBodySchema,
      },
      handler: holderController.patchUpdateHolder,
    });

    app.delete("/holders/:holderUuid", {
      schema: {
        tags: [HolderRoutes.TAG],
        params: holderUuidParamSchema,
      },
      handler: holderController.deleteHolder,
    });
  }
}
