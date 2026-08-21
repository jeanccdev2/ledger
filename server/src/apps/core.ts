import "reflect-metadata";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { dataSource } from "../database/datasource.js";
import { HolderRoutes } from "../modules/holders/holder.routes.js";
import { env } from "../shared/env.js";
import { setupContainer } from "../container/setup-container.js";
import fastifySwagger from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";
import { AppLogger } from "../shared/logger.js";
import { ApiResponse } from "../shared/api-response.js";
import { errorHandler } from "../shared/error-handler.js";
import { EntryRoutes } from "../modules/ledgers/entry.routes.js";
import { DefaultEntryRoutes } from "../modules/default-entries/default-entry.routes.js";

export class Core {
  private static readonly port = env.PORT;
  private static readonly host = env.HOST;
  private static readonly logger = new AppLogger("Core");

  static readonly app: FastifyInstance = Fastify({
    logger: false,
  });

  static async startApp(): Promise<void> {
    try {
      await dataSource.initialize();
      this.logger.log("Database connected successfully");

      this.app.setValidatorCompiler(validatorCompiler);
      this.app.setSerializerCompiler(serializerCompiler);

      setupContainer();
      this.configLifecycle();
      this.configErrorHandlers();
      this.configProcessSignals();

      await this.configOpenApi();
      this.addApiResponseHandler();
      await this.configRoutes();

      const address = await this.app.listen({
        port: this.port,
        host: this.host,
      });

      this.logger.log(`Core running at ${address}`);
    } catch (error) {
      this.logger.error(error, "Failed to start application");

      await this.closeResources();

      process.exit(1);
    }
  }

  private static configLifecycle(): void {
    this.app.addHook("onClose", async () => {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        this.logger.log("Database connection closed");
      }
    });
  }

  private static async configRoutes() {
    this.app.get("/health", async (_request, reply) => {
      return reply.status(200).send({
        status: "ok",
        database: dataSource.isInitialized ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      });
    });

    await this.app.register(HolderRoutes.defineRoutes);
    await this.app.register(EntryRoutes.defineRoutes);
    await this.app.register(DefaultEntryRoutes.defineRoutes);
  }

  private static configErrorHandlers(): void {
    this.app.setNotFoundHandler(async (request, reply) => {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: `Route ${request.method} ${request.url} not found`,
      });
    });

    this.app.setErrorHandler(errorHandler);
  }

  private static configProcessSignals(): void {
    let isShuttingDown = false;

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      this.logger.log({ signal }, "Shutdown signal received");

      try {
        await this.closeResources();

        this.logger.log("Application stopped successfully");
        process.exit(0);
      } catch (error) {
        this.logger.error(error, "Error during shutdown");
        process.exit(1);
      }
    };

    process.once("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.once("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  }

  private static async closeResources(): Promise<void> {
    try {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
      await this.app.close();
    } catch (error) {
      this.logger.error(error, "Failed to close application resources");
    }
  }

  private static async configOpenApi() {
    await this.app.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Wise SQL API",
          version: "1.0.0",
        },
      },
      transform: jsonSchemaTransform,
    });

    await this.app.register(scalarApiReference, {
      routePrefix: "/reference",
      configuration: {
        title: "Wise SQL API Reference",
        theme: "purple",
      },
    });
  }

  private static addApiResponseHandler() {
    this.app.addHook("preSerialization", async (request, reply, payload) => {
      if (payload instanceof ApiResponse) {
        reply.code(payload.status);
        let data: any = payload.data;
        let pagination: any;

        if (data.pagination) {
          pagination = data.pagination;
          data = payload.data?.data || payload.data;
        }

        return {
          status: payload.status,
          message: payload.message,
          data,
          ...(pagination && { pagination }),
        };
      }
      return payload;
    });
  }
}

void Core.startApp();
