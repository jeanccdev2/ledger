export const TOKENS = {
  Database: Symbol.for("Database"),
  Holders: {
    Repository: Symbol.for("HolderRepository"),
    Service: Symbol.for("HolderService"),
    Controller: Symbol.for("HolderController"),
  },
  Entries: {
    Repository: Symbol.for("EntryRepository"),
    Service: Symbol.for("EntryService"),
    Controller: Symbol.for("EntryController"),
  },
  DefaultEntries: {
    Repository: Symbol.for("DefaultEntryRepository"),
  },
  ChartOfAccounts: {
    Repository: Symbol.for("ChartOfAccountRepository"),
  },
} as const;
