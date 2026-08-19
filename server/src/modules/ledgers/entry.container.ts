import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { EntryRepository } from "./entry.repository.js";
import { EntryService } from "./entry.service.js";
import { EntryController, IEntryController } from "./entry.controller.js";

export function registerEntriesProvider(): void {
  container.registerSingleton(TOKENS.Entries.Repository, EntryRepository);
  container.registerSingleton(TOKENS.Entries.Service, EntryService);
  container.registerSingleton<IEntryController>(
    TOKENS.Entries.Controller,
    EntryController,
  );
}
