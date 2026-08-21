import { EntityManager, Repository } from "typeorm";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";
import { DefaultEntry } from "../../database/entities/default-entry.entity.js";

export interface IDefaultEntryRepository {
  setManager(manager: EntityManager): void;
  findByUuid(defaultEntryUuid: string): Promise<DefaultEntry | null>;
}

@injectable()
export class DefaultEntryRepository implements IDefaultEntryRepository {
  private defaultEntryRepo: Repository<DefaultEntry>;

  constructor() {
    this.defaultEntryRepo = dataSource.getRepository(DefaultEntry);
  }

  setManager(manager: EntityManager): void {
    this.defaultEntryRepo = manager.getRepository(DefaultEntry);
  }

  async findByUuid(defaultEntryUuid: string) {
    return this.defaultEntryRepo.findOneBy({
      uuid: defaultEntryUuid,
    });
  }
}
