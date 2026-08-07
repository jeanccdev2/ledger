// Feature: tsyringe-di, Property 1: singleton resolution returns same instance
import "reflect-metadata";
import fc from "fast-check";
import { container, singleton } from "tsyringe";
import { describe, test } from "vitest";

/**
 * Property 1: Singleton resolution returns the same instance
 *
 * For any class decorated with @singleton() and registered in the tsyringe
 * container, resolving that class from the container on any subsequent call
 * must return the exact same object reference as the first resolution.
 *
 * Validates: Requirements 2.5, 3.4, 4.3
 */
describe("Property 1: singleton resolution returns same instance", () => {
  test("singleton classes resolve to the same reference on every call", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10 }).filter((n) => n > 0), // resolution count 1–10
        (resolutionCount) => {
          // Create a fresh child container per iteration to avoid cross-test pollution
          const child = container.createChildContainer();

          @singleton()
          class TestSingleton {}

          const instances = Array.from({ length: resolutionCount }, () =>
            child.resolve(TestSingleton)
          );

          return instances.every((inst) => inst === instances[0]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
