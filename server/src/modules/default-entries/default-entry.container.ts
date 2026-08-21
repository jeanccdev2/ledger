import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { DefaultEntryRepository } from "./default-entry.repository.js";
import { DefaultEntryService } from "./default-entry.service.js";
import { DefaultEntryController } from "./default-entry.controller.js";

export function registerDefaultEntriesProvider(): void {
  container.registerSingleton(
    TOKENS.DefaultEntries.Repository,
    DefaultEntryRepository,
  );
  container.registerSingleton(
    TOKENS.DefaultEntries.Service,
    DefaultEntryService,
  );
  container.registerSingleton(
    TOKENS.DefaultEntries.Controller,
    DefaultEntryController,
  );
}
