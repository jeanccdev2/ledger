import "reflect-metadata";
import { registerDatabaseProvider } from "../database/container.js";

export function setupContainer(): void {
  registerDatabaseProvider();
}
