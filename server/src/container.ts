import { container, InjectionToken } from "tsyringe";
import type { DataSource } from "typeorm";

export const DATA_SOURCE_TOKEN: InjectionToken<DataSource> =
  Symbol("DataSource");

export { container };
