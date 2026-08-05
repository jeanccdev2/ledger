import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "db.sqlite",
  synchronize: true,
  logging: true,
  entities: [],
  subscribers: [],
  migrations: [],
});
