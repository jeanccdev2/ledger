import "reflect-metadata";
import { describe, it, expect, vi } from "vitest";
import { HolderController } from "./holder.controller.js";
import type { HolderService } from "../services/holder.service.js";
import type { FastifyReply, FastifyRequest } from "fastify";

// Minimal stub satisfying HolderService's public interface used by the controller
const mockService = {
  findAll: vi.fn().mockResolvedValue({ data: [], pagination: { totalRows: 0 } }),
  findOne: vi.fn(),
} as unknown as HolderService;

describe("HolderController — handler this-binding (Requirement 5.2)", () => {
  it("bound getFindAll retains the controller instance as its this context", async () => {
    const controller = new HolderController(mockService);
    const bound = controller.getFindAll.bind(controller);

    // The bound function must behave as if called on the controller:
    // accessing this.holderService must not throw and must delegate to the service.
    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    await bound({} as FastifyRequest, mockReply);

    expect(mockService.findAll).toHaveBeenCalledOnce();
  });

  it("unbound getFindAll invoked without a context throws a TypeError", async () => {
    const controller = new HolderController(mockService);

    // Extract the method without binding — in strict-mode ESM, `this` is undefined
    // when called as a plain function, so accessing this.holderService throws.
    const unbound = controller.getFindAll;

    await expect(
      // Call with explicit undefined context to simulate passing the raw function reference
      unbound.call(undefined as unknown as HolderController, {} as FastifyRequest, {} as FastifyReply)
    ).rejects.toThrow(TypeError);
  });
});
