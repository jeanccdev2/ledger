import { Repository } from "typeorm";
import { Holder } from "../../../database/entities/holder.entity.js";
import { Server } from "../../../apps/core.js";

export class HolderRepository {
  private holderRepo: Repository<Holder>;

  constructor() {
    this.holderRepo = Server.appDataSource.getRepository(Holder);
  }

  async findAll() {
    return this.holderRepo.findAndCount();
  }

  async findById(holderId: number) {
    return this.holderRepo.findOneBy({
      id: holderId,
    });
  }
}
