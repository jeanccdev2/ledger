import { Repository } from "typeorm";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";
import { DefaultEntry } from "../../database/entities/default-entry.entity.js";

export interface IDefaultEntryRepository {
  findByUuid(defaultEntryUuid: string): Promise<DefaultEntry | null>;
}

@injectable()
export class DefaultEntryRepository implements IDefaultEntryRepository {
  private defaultEntryRepo: Repository<DefaultEntry>;

  constructor() {
    this.defaultEntryRepo = dataSource.getRepository(DefaultEntry);
  }

  async findByUuid(defaultEntryUuid: string) {
    return this.defaultEntryRepo.findOneBy({
      uuid: defaultEntryUuid,
    });
  }
}
