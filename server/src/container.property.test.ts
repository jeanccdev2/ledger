// Feature: tsyringe-di, Property 2: useValue registration preserves object reference
import "reflect-metadata";
import { describe, it } from "vitest";
import fc from "fast-check";
import { container } from "tsyringe";

describe("DI container property tests", () => {
  /**
   * Property 2: useValue registration preserves object reference
   *
   * For any pre-instantiated object registered under a token with { useValue: instance },
   * resolving that token must return an object reference strictly equal (===) to the
   * original registered instance, regardless of how many times it is resolved.
   *
   * Validates: Requirements 6.2
   */
  it("value registered with useValue resolves to the same reference", () => {
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid(), value: fc.string() }),
        fc.nat({ max: 10 }).filter((n) => n > 0),
        (obj, resolutionCount) => {
          const child = container.createChildContainer();
          const token = Symbol("test-token");
          child.register(token as any, { useValue: obj });

          const instances = Array.from({ length: resolutionCount }, () =>
            child.resolve(token as any)
          );

          return instances.every((inst) => inst === obj);
        }
      ),
      { numRuns: 100 }
    );
  });
});
