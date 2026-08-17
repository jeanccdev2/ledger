import "reflect-metadata";
import { registerDatabaseProvider } from "../database/database.container.js";
import { registerHoldersProvider } from "../modules/holders/holder.container.js";

export function setupContainer(): void {
  registerDatabaseProvider();
  registerHoldersProvider();
}
