import { EntityManager, Repository, FindOptionsWhere, Like, FindOptionsRelations } from "typeorm";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";
import { DefaultEntry } from "../../database/entities/default-entry.entity.js";
import { TriggerDefaultEntry } from "../../database/entities/trigger-default-entry.entity.js";
import { v4 } from "uuid";

export const defaultEntryRelations: FindOptionsRelations<DefaultEntry> = {
  accountDebit: true,
  accountCredit: true,
  triggerEntries: {
    triggerDefaultEntry: true,
  },
};

export interface IDefaultEntryRepository {
  setManager(manager: EntityManager): void;
  findAll(
    limit: number,
    offset: number,
    name?: string | null,
    status?: "active" | "inactive" | null,
  ): Promise<[DefaultEntry[], number]>;
  findByUuid(
    defaultEntryUuid: string,
    relations?: FindOptionsRelations<DefaultEntry>,
  ): Promise<DefaultEntry | null>;
  save(defaultEntry: Partial<DefaultEntry>): Promise<DefaultEntry>;
  delete(defaultEntryUuid: string): Promise<DefaultEntry>;
  saveTriggerEntries(
    defaultEntryId: number,
    triggers: Array<Partial<TriggerDefaultEntry>>,
  ): Promise<void>;
  clearTriggerEntries(defaultEntryId: number): Promise<void>;
}

@injectable()
export class DefaultEntryRepository implements IDefaultEntryRepository {
  private defaultEntryRepo: Repository<DefaultEntry>;
  private triggerDefaultEntryRepo: Repository<TriggerDefaultEntry>;

  constructor() {
    this.defaultEntryRepo = dataSource.getRepository(DefaultEntry);
    this.triggerDefaultEntryRepo = dataSource.getRepository(TriggerDefaultEntry);
  }

  setManager(manager: EntityManager): void {
    this.defaultEntryRepo = manager.getRepository(DefaultEntry);
    this.triggerDefaultEntryRepo = manager.getRepository(TriggerDefaultEntry);
  }

  async findAll(
    limit: number,
    offset: number,
    name?: string | null,
    status?: "active" | "inactive" | null,
  ) {
    const filters: FindOptionsWhere<DefaultEntry> = {};

    if (name) filters.name = Like(`%${name}%`);
    if (status) filters.status = status;

    return this.defaultEntryRepo.findAndCount({
      take: limit,
      skip: offset,
      where: filters,
      relations: defaultEntryRelations,
    });
  }

  async findByUuid(
    defaultEntryUuid: string,
    relations: FindOptionsRelations<DefaultEntry> = defaultEntryRelations,
  ) {
    return this.defaultEntryRepo.findOne({
      where: { uuid: defaultEntryUuid },
      relations,
    });
  }

  async save(defaultEntry: Partial<DefaultEntry>) {
    if (!defaultEntry.uuid) {
      defaultEntry.uuid = v4();
    }
    return this.defaultEntryRepo.save(defaultEntry as DefaultEntry);
  }

  async delete(defaultEntryUuid: string) {
    const defaultEntry = await this.findByUuid(defaultEntryUuid, {});
    if (!defaultEntry) {
      throw new Error("Default entry not found");
    }
    return this.defaultEntryRepo.softRemove(defaultEntry);
  }

  async saveTriggerEntries(
    defaultEntryId: number,
    triggers: Array<Partial<TriggerDefaultEntry>>,
  ): Promise<void> {
    const entities = triggers.map((t) =>
      this.triggerDefaultEntryRepo.create({
        ...t,
        default_entry_id: defaultEntryId,
      }),
    );
    await this.triggerDefaultEntryRepo.save(entities);
  }

  async clearTriggerEntries(defaultEntryId: number): Promise<void> {
    await this.triggerDefaultEntryRepo.delete({
      default_entry_id: defaultEntryId,
    });
  }
}
