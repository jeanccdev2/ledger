import "reflect-metadata";
import { registerDatabaseProvider } from "../database/database.container.js";
import { registerHoldersProvider } from "../modules/holders/holder.container.js";
import { registerEntriesProvider } from "../modules/ledgers/entry.container.js";
import { registerDefaultEntriesProvider } from "../modules/default-entries/default-entry.container.js";
import { registerChartOfAccountsProvider } from "../modules/chart-of-accounts/chart-of-account.container.js";

export function setupContainer(): void {
  registerDatabaseProvider();
  registerHoldersProvider();
  registerEntriesProvider();
  registerDefaultEntriesProvider();
  registerChartOfAccountsProvider();
}
