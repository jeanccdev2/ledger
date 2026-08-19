import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { DefaultEntryRepository } from "./default-entry.repository.js";

export function registerDefaultEntriesProvider(): void {
  container.registerSingleton(
    TOKENS.DefaultEntries.Repository,
    DefaultEntryRepository,
  );
}
