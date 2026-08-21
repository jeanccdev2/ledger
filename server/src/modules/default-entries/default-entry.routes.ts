import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { IDefaultEntryController } from "./default-entry.controller.js";
import {
  createDefaultEntryBodySchema,
  defaultEntryUuidParamSchema,
  findAllDefaultEntriesQuerySchema,
  updateDefaultEntryBodySchema,
} from "./default-entries.validations.js";

export class DefaultEntryRoutes {
  private static TAG = "Default Entries";

  static async defineRoutes(fastify: FastifyInstance) {
    const defaultEntryController = container.resolve<IDefaultEntryController>(
      TOKENS.DefaultEntries.Controller,
    );
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get("/default-entries", {
      schema: {
        tags: [DefaultEntryRoutes.TAG],
        querystring: findAllDefaultEntriesQuerySchema,
      },
      handler: defaultEntryController.getFindAll,
    });

    app.get("/default-entries/:defaultEntryUuid", {
      schema: {
        tags: [DefaultEntryRoutes.TAG],
        params: defaultEntryUuidParamSchema,
      },
      handler: defaultEntryController.getByUuid,
    });

    app.post("/default-entries", {
      schema: {
        tags: [DefaultEntryRoutes.TAG],
        body: createDefaultEntryBodySchema,
      },
      handler: defaultEntryController.postCreateDefaultEntry,
    });

    app.patch("/default-entries/:defaultEntryUuid", {
      schema: {
        tags: [DefaultEntryRoutes.TAG],
        params: defaultEntryUuidParamSchema,
        body: updateDefaultEntryBodySchema,
      },
      handler: defaultEntryController.patchUpdateDefaultEntry,
    });

    app.delete("/default-entries/:defaultEntryUuid", {
      schema: {
        tags: [DefaultEntryRoutes.TAG],
        params: defaultEntryUuidParamSchema,
      },
      handler: defaultEntryController.deleteDefaultEntry,
    });
  }
}
