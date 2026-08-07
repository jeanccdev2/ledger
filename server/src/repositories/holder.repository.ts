import { inject, singleton } from "tsyringe";
import type { DataSource, Repository } from "typeorm";
import { Holder } from "../database/entities/holder.entity.js";
import { DATA_SOURCE_TOKEN } from "../container.js";

@singleton()
export class HolderRepository {
  private holderRepo: Repository<Holder>;

  constructor(@inject(DATA_SOURCE_TOKEN) dataSource: DataSource) {
    this.holderRepo = dataSource.getRepository(Holder);
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
