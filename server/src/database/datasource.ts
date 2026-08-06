import "reflect-metadata";
import { DataSource } from "typeorm";
import { ChartOfAccount } from "./entities/chart-of-account.entity.js";
import { DefaultEntry } from "./entities/default-entry.entity.js";
import { Entry } from "./entities/entry.entity.js";
import { HolderAccount } from "./entities/holder-account.entity.js";
import { Holder } from "./entities/holder.entity.js";
import { TriggerDefaultEntry } from "./entities/trigger-default-entry.entity.js";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "db.sqlite",
  synchronize: false, // Set to false to use migrations properly
  logging: true,
  entities: [
    ChartOfAccount,
    DefaultEntry,
    Entry,
    HolderAccount,
    Holder,
    TriggerDefaultEntry
  ],
  subscribers: [],
  migrations: import.meta.url.endsWith(".js")
    ? ["dist/database/migrations/*.js"]
    : ["src/database/migrations/*.ts"],
});

