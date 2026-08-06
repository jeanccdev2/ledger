import "reflect-metadata";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { DataSource } from "typeorm";
import { datasourceConfig } from "./database/datasource.js";

class Server {
  private static readonly port = Number(process.env.PORT ?? 3000);
  private static readonly host = process.env.HOST ?? "127.0.0.1";

  static readonly app: FastifyInstance = Fastify({
    logger: true,
    bodyLimit: 1024 * 1024,
  });

  static readonly appDataSource = new DataSource(datasourceConfig);

  static async startApp(): Promise<void> {
    try {
      await Server.appDataSource.initialize();

      Server.app.log.info("Database connected successfully");

      Server.configLifecycle();
      Server.configRoutes();
      Server.configErrorHandlers();
      Server.configProcessSignals();

      const address = await Server.app.listen({
        port: Server.port,
        host: Server.host,
      });

      Server.app.log.info(`Server running at ${address}`);
    } catch (error) {
      Server.app.log.error(error, "Failed to start application");

      await Server.closeResources();

      process.exit(1);
    }
  }

  private static configLifecycle(): void {
    Server.app.addHook("onClose", async () => {
      if (Server.appDataSource.isInitialized) {
        await Server.appDataSource.destroy();
        Server.app.log.info("Database connection closed");
      }
    });
  }

  private static configRoutes(): void {
    Server.app.get("/health", async (_request, reply) => {
      return reply.status(200).send({
        status: "ok",
        database: Server.appDataSource.isInitialized
          ? "connected"
          : "disconnected",
        timestamp: new Date().toISOString(),
      });
    });
  }

  private static configErrorHandlers(): void {
    Server.app.setNotFoundHandler(async (request, reply) => {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: `Route ${request.method} ${request.url} not found`,
      });
    });

    Server.app.setErrorHandler(async (error: FastifyError, request, reply) => {
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

      Server.app.log.info({ signal }, "Shutdown signal received");

      try {
        await Server.closeResources();

        Server.app.log.info("Application stopped successfully");
        process.exit(0);
      } catch (error) {
        Server.app.log.error(error, "Error during shutdown");
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
      if (Server.appDataSource.isInitialized) {
        await Server.appDataSource.destroy();
      }
      await Server.app.close();
    } catch (error) {
      Server.app.log.error(error, "Failed to close application resources");
    }
  }
}

void Server.startApp();
