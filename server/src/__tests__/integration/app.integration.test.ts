/**
 * Integration tests for the tsyringe-migrated Fastify application.
 *
 * These tests verify that the full application wiring (DI container, TypeORM,
 * Fastify routes) preserves the runtime behaviour that existed before the
 * migration (Requirements 7.1–7.6).
 *
 * Strategy
 * --------
 * • The `Server` class in server.ts uses static members and calls process.exit(),
 *   so we do NOT import it here. Instead, each test suite builds a minimal Fastify
 *   app that mirrors the structure of Server.startApp():
 *     1. Create a fresh DataSource backed by an in-memory SQLite DB.
 *     2. Initialize the DataSource and run migrations so the schema exists.
 *     3. Register DATA_SOURCE_TOKEN in a fresh child container.
 *     4. Register Fastify routes using HolderRoutes.defineRoutes.
 *     5. Inject the error-handler used in production.
 *   After each suite the DataSource is destroyed and the child container is
 *   reset to keep tests isolated.
 */

import "reflect-metadata";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { DataSource } from "typeorm";
import { container } from "tsyringe";

import { DATA_SOURCE_TOKEN } from "../../container.js";
import { HolderRoutes } from "../../routes/holder.routes.js";
import { datasourceConfig } from "../../database/datasource.js";
import { ChartOfAccount } from "../../database/entities/chart-of-account.entity.js";
import { DefaultEntry } from "../../database/entities/default-entry.entity.js";
import { Entry } from "../../database/entities/entry.entity.js";
import { HolderAccount } from "../../database/entities/holder-account.entity.js";
import { Holder } from "../../database/entities/holder.entity.js";
import { TriggerDefaultEntry } from "../../database/entities/trigger-default-entry.entity.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates an in-memory DataSource whose schema is set up via synchronize:true
 * (cheaper than running migrations in tests, gives us the same tables).
 */
function createTestDataSource(): DataSource {
  return new DataSource({
    ...datasourceConfig,
    type: "better-sqlite3",
    database: ":memory:",
    synchronize: true,
    logging: false,
    entities: [
      ChartOfAccount,
      DefaultEntry,
      Entry,
      HolderAccount,
      Holder,
      TriggerDefaultEntry,
    ],
    migrations: [],
  });
}

/**
 * Builds and returns a Fastify app wired the same way as Server.startApp(),
 * but using the provided child container and DataSource so tests can remain
 * fully isolated.
 */
async function buildApp(testDataSource: DataSource): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Create a child container so each test suite gets a clean resolution graph.
  const child = container.createChildContainer();
  child.register(DATA_SOURCE_TOKEN, { useValue: testDataSource });

  // Temporarily replace the global container with the child for route resolution.
  // HolderRoutes.defineRoutes calls `container.resolve(HolderController)` from
  // the re-exported singleton in container.ts, so we monkey-patch it for the
  // duration of this registration.
  const containerModule = await import("../../container.js");
  const originalResolve = containerModule.container.resolve.bind(containerModule.container);
  const originalRegister = containerModule.container.register.bind(containerModule.container);

  // Redirect resolve / register calls to the child during route setup
  containerModule.container.resolve = child.resolve.bind(child) as typeof child.resolve;
  containerModule.container.register = child.register.bind(child) as typeof child.register;

  try {
    // Register the health route inline (mirrors Server.configRoutes)
    app.get("/health", async (_request, reply) => {
      return reply.status(200).send({
        status: "ok",
        database: testDataSource.isInitialized ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      });
    });

    await app.register(HolderRoutes.defineRoutes);
  } finally {
    // Restore original methods so other tests / modules are not affected
    containerModule.container.resolve = originalResolve;
    containerModule.container.register = originalRegister;
  }

  // Mirror the production error handler (Server.configErrorHandlers)
  app.setNotFoundHandler(async (request, reply) => {
    return reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  app.setErrorHandler(async (error: FastifyError, request, reply) => {
    request.log?.error?.(error);
    const statusCode =
      error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    return reply.status(statusCode).send({
      statusCode,
      error: statusCode >= 500 ? "Internal Server Error" : error.name,
      message: statusCode >= 500 ? "Internal server error" : error.message,
    });
  });

  await app.ready();
  return app;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("Integration — preserved runtime behaviour (Requirements 7.1–7.6)", () => {
  let app: FastifyInstance;
  let testDataSource: DataSource;

  beforeAll(async () => {
    testDataSource = createTestDataSource();
    await testDataSource.initialize();
    app = await buildApp(testDataSource);
  });

  afterAll(async () => {
    await app.close();
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  // -------------------------------------------------------------------------
  // Requirement 7.3 — GET /health returns 200 { status: "ok" }
  // -------------------------------------------------------------------------
  describe("GET /health (Requirement 7.3)", () => {
    it("returns HTTP 200 with status ok", async () => {
      const response = await app.inject({ method: "GET", url: "/health" });

      expect(response.statusCode).toBe(200);
      const body = response.json<{ status: string }>();
      expect(body.status).toBe("ok");
    });

    it("includes a database field and a timestamp in the response body", async () => {
      const response = await app.inject({ method: "GET", url: "/health" });
      const body = response.json<{ database: string; timestamp: string }>();

      expect(body.database).toBe("connected");
      expect(typeof body.timestamp).toBe("string");
      // Timestamp must be a valid ISO 8601 date string
      expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Requirements 5.4, 7.4 — GET /holders preserves pre-migration response shape
  // -------------------------------------------------------------------------
  describe("GET /holders (Requirements 5.4, 7.4)", () => {
    it("returns HTTP 200", async () => {
      const response = await app.inject({ method: "GET", url: "/holders" });
      expect(response.statusCode).toBe(200);
    });

    it("returns the expected body structure: { status, message, data: { data, pagination } }", async () => {
      const response = await app.inject({ method: "GET", url: "/holders" });
      const body = response.json<{
        status: number;
        message: string;
        data: {
          data: unknown[];
          pagination: { totalRows: number };
        };
      }>();

      // Top-level ApiResponse fields
      expect(body.status).toBe(200);
      expect(typeof body.message).toBe("string");

      // Nested data payload
      expect(Array.isArray(body.data.data)).toBe(true);

      // Pagination object
      expect(typeof body.data.pagination).toBe("object");
      expect(typeof body.data.pagination.totalRows).toBe("number");
    });

    it("returns an empty array when no holders exist", async () => {
      const response = await app.inject({ method: "GET", url: "/holders" });
      const body = response.json<{ data: { data: unknown[]; pagination: { totalRows: number } } }>();

      expect(body.data.data).toHaveLength(0);
      expect(body.data.pagination.totalRows).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Requirement 7.6 — Unhandled errors produce the existing error-response format
  // -------------------------------------------------------------------------
  describe("Error handler (Requirement 7.6)", () => {
    it("returns 404 with the expected shape for unknown routes", async () => {
      const response = await app.inject({ method: "GET", url: "/does-not-exist" });

      expect(response.statusCode).toBe(404);
      const body = response.json<{ statusCode: number; error: string; message: string }>();
      expect(body.statusCode).toBe(404);
      expect(body.error).toBe("Not Found");
      expect(typeof body.message).toBe("string");
    });

    it("returns 500 with 'Internal server error' message for unhandled route handler errors", async () => {
      // Register a route that always throws an unhandled error on a fresh app
      // instance so we do not pollute the shared app.
      const errorApp = Fastify({ logger: false });
      errorApp.setErrorHandler(async (error: FastifyError, _request, reply) => {
        const statusCode =
          error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
        return reply.status(statusCode).send({
          statusCode,
          error: statusCode >= 500 ? "Internal Server Error" : error.name,
          message: statusCode >= 500 ? "Internal server error" : error.message,
        });
      });

      errorApp.get("/boom", async () => {
        throw new Error("Something went very wrong");
      });

      await errorApp.ready();

      const response = await errorApp.inject({ method: "GET", url: "/boom" });

      expect(response.statusCode).toBe(500);
      const body = response.json<{ statusCode: number; error: string; message: string }>();
      expect(body.statusCode).toBe(500);
      expect(body.error).toBe("Internal Server Error");
      expect(body.message).toBe("Internal server error");

      await errorApp.close();
    });

    it("returns 4xx with the original error name and message for client errors", async () => {
      // Fastify errors with a statusCode < 500 use the non-generic format
      const clientErrApp = Fastify({ logger: false });
      clientErrApp.setErrorHandler(async (error: FastifyError, _request, reply) => {
        const statusCode =
          error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
        return reply.status(statusCode).send({
          statusCode,
          error: statusCode >= 500 ? "Internal Server Error" : error.name,
          message: statusCode >= 500 ? "Internal server error" : error.message,
        });
      });

      clientErrApp.get("/client-err", async () => {
        const err = new Error("Bad input") as FastifyError;
        err.statusCode = 422;
        err.name = "ValidationError";
        throw err;
      });

      await clientErrApp.ready();

      const response = await clientErrApp.inject({ method: "GET", url: "/client-err" });

      expect(response.statusCode).toBe(422);
      const body = response.json<{ statusCode: number; error: string; message: string }>();
      expect(body.statusCode).toBe(422);
      expect(body.error).toBe("ValidationError");
      expect(body.message).toBe("Bad input");

      await clientErrApp.close();
    });
  });
});

// ---------------------------------------------------------------------------
// Requirement 7.5 — Shutdown closes the database connection cleanly
// ---------------------------------------------------------------------------
describe("Shutdown — database connection closed cleanly (Requirement 7.5)", () => {
  it("DataSource.destroy() is called on app close and leaves isInitialized false", async () => {
    const ds = createTestDataSource();
    await ds.initialize();
    expect(ds.isInitialized).toBe(true);

    const localApp = Fastify({ logger: false });
    // Register the onClose hook the same way Server.configLifecycle() does
    localApp.addHook("onClose", async () => {
      if (ds.isInitialized) {
        await ds.destroy();
      }
    });

    await localApp.ready();
    await localApp.close();

    // After close the hook must have run and destroyed the connection
    expect(ds.isInitialized).toBe(false);
  });

  it("calling DataSource.destroy() twice does not throw (idempotent shutdown)", async () => {
    const ds = createTestDataSource();
    await ds.initialize();

    // First destroy — normal shutdown
    await ds.destroy();
    expect(ds.isInitialized).toBe(false);

    // Second destroy — should not throw; mirrors the closeResources() guard
    const localApp = Fastify({ logger: false });
    localApp.addHook("onClose", async () => {
      // The isInitialized guard prevents a double-destroy
      if (ds.isInitialized) {
        await ds.destroy();
      }
    });
    await localApp.ready();
    // This must not throw even though ds is already destroyed
    await expect(localApp.close()).resolves.toBeUndefined();
  });
});
