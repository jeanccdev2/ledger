import { container } from "tsyringe";
import { DataSource } from "typeorm";
import { TOKENS } from "../container/tokens.js";
import { dataSource } from "./datasource.js";

export function registerDatabaseProvider(): void {
  container.registerInstance<DataSource>(TOKENS.Database, dataSource);
}
