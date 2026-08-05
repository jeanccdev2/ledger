import "reflect-metadata";
import { AppDataSource } from "./database/datasource.js";

class Server {
  constructor() {
    this.startApp();
  }

  private async startApp() {
    AppDataSource.initialize();
  }
}

export const server = new Server();
