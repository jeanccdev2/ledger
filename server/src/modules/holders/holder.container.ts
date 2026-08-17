import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { HolderRepository } from "./holder.repository.js";
import { HolderService } from "./holder.service.js";
import { HolderController, IHolderController } from "./holder.controller.js";

export function registerHoldersProvider(): void {
  container.registerSingleton(TOKENS.Holders.Repository, HolderRepository);
  container.registerSingleton(TOKENS.Holders.Service, HolderService);
  container.registerSingleton<IHolderController>(
    TOKENS.Holders.Controller,
    HolderController,
  );
}
