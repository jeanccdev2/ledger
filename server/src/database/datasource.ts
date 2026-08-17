import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { ChartOfAccount } from "./entities/chart-of-account.entity.js";
import { DefaultEntry } from "./entities/default-entry.entity.js";
import { Entry } from "./entities/entry.entity.js";
import { HolderAccount } from "./entities/holder-account.entity.js";
import { Holder } from "./entities/holder.entity.js";
import { TriggerDefaultEntry } from "./entities/trigger-default-entry.entity.js";
import { env } from "../shared/env.js";

export const datasourceConfig: DataSourceOptions = {
  type: "better-sqlite3",
  database: env.DB_PATH,
  synchronize: false, // Set to false to use migrations properly
  logging: true,
  entities: [
    ChartOfAccount,
    DefaultEntry,
    Entry,
    HolderAccount,
    Holder,
    TriggerDefaultEntry,
  ],
  subscribers: [],
  migrations: import.meta.url.endsWith(".js")
    ? ["dist/database/migrations/*.js"]
    : ["src/database/migrations/*.ts"],
};
