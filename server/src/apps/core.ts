import "reflect-metadata";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { DataSource } from "typeorm";
import { datasourceConfig } from "../database/datasource.js";
import { HolderRoutes } from "../modules/holders/holder.routes.js";
import { env } from "../shared/env.js";
import { setupContainer } from "../container/setup-container.js";
import fastifySwagger from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";

export class Server {
  private static readonly port = env.PORT;
  private static readonly host = env.HOST;

  static readonly app: FastifyInstance = Fastify({
    logger: true,
  });

  static readonly appDataSource = new DataSource(datasourceConfig);

  static async startApp(): Promise<void> {
    try {
      await this.appDataSource.initialize();
      this.app.log.info("Database connected successfully");

      this.app.setValidatorCompiler(validatorCompiler);
      this.app.setSerializerCompiler(serializerCompiler);

      setupContainer();
      this.configLifecycle();
      this.configErrorHandlers();
      this.configProcessSignals();

      await this.configOpenApi();
      await this.configRoutes();

      const address = await this.app.listen({
        port: this.port,
        host: this.host,
      });

      this.app.log.info(`Server running at ${address}`);
    } catch (error) {
      this.app.log.error(error, "Failed to start application");

      await this.closeResources();

      process.exit(1);
    }
  }

  private static configLifecycle(): void {
    this.app.addHook("onClose", async () => {
      if (this.appDataSource.isInitialized) {
        await this.appDataSource.destroy();
        this.app.log.info("Database connection closed");
      }
    });
  }

  private static async configRoutes() {
    this.app.get("/health", async (_request, reply) => {
      return reply.status(200).send({
        status: "ok",
        database: this.appDataSource.isInitialized
          ? "connected"
          : "disconnected",
        timestamp: new Date().toISOString(),
      });
    });

    await this.app.register(HolderRoutes.defineRoutes);
  }

  private static configErrorHandlers(): void {
    this.app.setNotFoundHandler(async (request, reply) => {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: `Route ${request.method} ${request.url} not found`,
      });
    });

    this.app.setErrorHandler(async (error: FastifyError, request, reply) => {
      request.log.error(error);

      const statusCode =
        error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;

      return reply.status(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? "Internal Server Error" : error.name,
        message: statusCode >= 500 ? "Internal server error" : error.message,
      });
    });
  }

  private static configProcessSignals(): void {
    let isShuttingDown = false;

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      this.app.log.info({ signal }, "Shutdown signal received");

      try {
        await this.closeResources();

        this.app.log.info("Application stopped successfully");
        process.exit(0);
      } catch (error) {
        this.app.log.error(error, "Error during shutdown");
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
      if (this.appDataSource.isInitialized) {
        await this.appDataSource.destroy();
      }
      await this.app.close();
    } catch (error) {
      this.app.log.error(error, "Failed to close application resources");
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
    });

    await this.app.register(scalarApiReference, {
      routePrefix: "/reference",
      configuration: {
        title: "Wise SQL API Reference",
        theme: "purple",
      },
    });
  }
}

void Server.startApp();
