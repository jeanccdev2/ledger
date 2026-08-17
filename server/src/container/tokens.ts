export const TOKENS = {
  Database: Symbol.for("Database"),
  Holders: {
    Repository: Symbol.for("HolderRepository"),
    Service: Symbol.for("HolderService"),
    Controller: Symbol.for("HolderController"),
  },
} as const;
