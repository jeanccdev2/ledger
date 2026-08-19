import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { IEntryController } from "./entry.controller.js";
import {
  createEntryBodySchema,
  findAllEntriesQuerySchema,
  entryUuidParamSchema,
  updateEntryBodySchema,
} from "./entry.validations.js";

export class EntryRoutes {
  private static TAG = "Entries";

  static async defineRoutes(fastify: FastifyInstance) {
    const entryController = container.resolve<IEntryController>(
      TOKENS.Entries.Controller,
    );
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get("/entries", {
      schema: {
        tags: [EntryRoutes.TAG],
        querystring: findAllEntriesQuerySchema,
      },
      handler: entryController.getFindAll,
    });

    app.get("/entries/:entryUuid", {
      schema: {
        tags: [EntryRoutes.TAG],
        params: entryUuidParamSchema,
      },
      handler: entryController.getByUuid,
    });

    app.post("/entries", {
      schema: {
        tags: [EntryRoutes.TAG],
        body: createEntryBodySchema,
      },
      handler: entryController.postCreateEntry,
    });

    app.patch("/entries/:entryUuid", {
      schema: {
        tags: [EntryRoutes.TAG],
        params: entryUuidParamSchema,
        body: updateEntryBodySchema,
      },
      handler: entryController.patchUpdateEntry,
    });
  }
}
