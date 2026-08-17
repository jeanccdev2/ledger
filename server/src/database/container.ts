import { container } from "tsyringe";
import { DataSource } from "typeorm";
import { TOKENS } from "../container/tokens.js";
import { Server } from "../apps/core.js";

export function registerDatabaseProvider(): void {
  container.registerInstance<DataSource>(TOKENS.Database, Server.appDataSource);
}
