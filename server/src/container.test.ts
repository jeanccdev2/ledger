import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { container as tsyringeContainer, injectable, inject } from "tsyringe";
import { DATA_SOURCE_TOKEN, container } from "./container.js";

describe("container module", () => {
  describe("DATA_SOURCE_TOKEN", () => {
    it("is a Symbol (InjectionToken<DataSource>)", () => {
      expect(typeof DATA_SOURCE_TOKEN).toBe("symbol");
    });

    it("has a descriptive name identifying the DataSource", () => {
      expect(DATA_SOURCE_TOKEN.toString()).toBe("Symbol(DataSource)");
    });

    it("is unique — two references are the same token identity", async () => {
      // InjectionToken<DataSource> must be a stable, singleton reference.
      // Re-importing the module returns the exact same Symbol instance.
      const { DATA_SOURCE_TOKEN: reimported } = await import("./container.js");
      expect(reimported).toBe(DATA_SOURCE_TOKEN);
    });
  });

  describe("container", () => {
    it("is the tsyringe container singleton", () => {
      expect(container).toBe(tsyringeContainer);
    });

    it("exposes a resolve method (confirms it is a DependencyContainer)", () => {
      expect(typeof container.resolve).toBe("function");
    });

    it("exposes a register method (confirms it is a DependencyContainer)", () => {
      expect(typeof container.register).toBe("function");
    });
  });

  // -------------------------------------------------------------------------
  // Error condition tests (Requirements 1.5, 6.4)
  // Each test uses a fresh child container so the global container state is
  // not polluted and DATA_SOURCE_TOKEN registered by other tests is invisible.
  // -------------------------------------------------------------------------
  describe("error conditions", () => {
    it("resolving an unregistered token throws with a message identifying the token (Requirement 1.5)", () => {
      // Use a child container that has no registrations of its own.
      // The unregistered Symbol token will not be found in any ancestor.
      const child = container.createChildContainer();
      const unknownToken = Symbol("UnknownService");

      expect(() => child.resolve(unknownToken as any)).toThrowError(
        /Attempted to resolve unregistered dependency token:.*UnknownService/
      );
    });

    it("resolving a class that depends on an unregistered token throws with a descriptive message (Requirement 1.5)", () => {
      // Create a completely isolated child container and register a class
      // that requires a token which is intentionally not registered.
      const child = container.createChildContainer();
      const missingToken = Symbol("MissingDep");

      @injectable()
      class NeedsToken {
        constructor(@inject(missingToken) _dep: unknown) {}
      }

      // Register the class itself so the container knows about it,
      // but leave missingToken unregistered — the resolution must throw.
      child.register(NeedsToken, { useClass: NeedsToken });

      expect(() => child.resolve(NeedsToken)).toThrowError(
        /Attempted to resolve unregistered dependency token:.*MissingDep/
      );
    });

    it("resolving a class whose transitive dependency is an unregistered token throws (Requirement 6.4)", () => {
      // Simulate the HolderController → HolderService → HolderRepository → DataSource
      // dependency chain using explicit @inject() tokens throughout so tsyringe can
      // resolve the chain without needing emitDecoratorMetadata class inference.
      //
      // The important property: if DATA_SOURCE_TOKEN (or any token in the chain)
      // is absent, tsyringe throws before any instance is constructed.
      const child = container.createChildContainer();

      const dataSourceToken = Symbol("DataSource");
      const repoToken = Symbol("FakeRepository");
      const serviceToken = Symbol("FakeService");
      const controllerToken = Symbol("FakeController");

      @injectable()
      class FakeRepository {
        constructor(@inject(dataSourceToken) _ds: unknown) {}
      }

      @injectable()
      class FakeService {
        constructor(@inject(repoToken) _repo: unknown) {}
      }

      @injectable()
      class FakeController {
        constructor(@inject(serviceToken) _svc: unknown) {}
      }

      child.register(repoToken, { useClass: FakeRepository });
      child.register(serviceToken, { useClass: FakeService });
      child.register(controllerToken, { useClass: FakeController });
      // Intentionally omit: child.register(dataSourceToken, ...) — this is the scenario

      expect(() => child.resolve(controllerToken)).toThrowError(
        /Attempted to resolve unregistered dependency token:.*DataSource/
      );
    });
  });
});
