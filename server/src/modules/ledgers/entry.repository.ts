import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";
import { v4 } from "uuid";
import { Entry } from "../../database/entities/entry.entity.js";
import { ApiResponse } from "../../shared/api-response.js";

export type FindAllFilters = {
  nsu?: string | null | undefined;
  debitAccountId?: number | null | undefined;
  creditAccountId?: number | null | undefined;
  description?: string | null | undefined;
  defaultEntryId?: number | null | undefined;
  dateFrom?: Date | null | undefined;
  dateTo?: Date | null | undefined;
};

export interface IEntryRepository {
  findAll(
    limit: number,
    page: number,
    filters: FindAllFilters,
  ): Promise<[Entry[], number]>;
  findByUuid(entryUuid: string): Promise<Entry | null>;
  create(
    nsu: string,
    debitAccountId: number,
    creditAccountId: number,
    amountCents: bigint,
    debitBalanceCents: bigint,
    creditBalanceCents: bigint,
    description: string | null,
    defaultEntryId: number,
  ): Promise<Entry>;
  update(entryUuid: string, description: string | null): Promise<Entry>;
  delete(entryUuid: string): Promise<Entry>;
}

@injectable()
export class EntryRepository implements IEntryRepository {
  private entryRepo: Repository<Entry>;

  constructor() {
    this.entryRepo = dataSource.getRepository(Entry);
  }

  async findAll(limit: number, offset: number, filters: FindAllFilters) {
    const whereClause: FindOptionsWhere<Entry> = {};

    if (filters.nsu) whereClause.nsu = filters.nsu;
    if (filters.debitAccountId)
      whereClause.debit_account_id = filters.debitAccountId;
    if (filters.creditAccountId)
      whereClause.credit_account_id = filters.creditAccountId;
    if (filters.description)
      whereClause.description = Like(`%${filters.description}%`);
    if (filters.defaultEntryId)
      whereClause.default_entry_id = filters.defaultEntryId;
    if (filters.dateFrom && filters.dateTo) {
      whereClause.created_at = Between(filters.dateFrom, filters.dateTo);
    } else if (filters.dateFrom) {
      whereClause.created_at = MoreThanOrEqual(filters.dateFrom);
    } else if (filters.dateTo) {
      whereClause.created_at = LessThanOrEqual(filters.dateTo);
    }

    return this.entryRepo.findAndCount({
      take: limit,
      skip: offset,
      where: whereClause,
    });
  }

  async findByUuid(entryUuid: string) {
    return this.entryRepo.findOneBy({
      uuid: entryUuid,
    });
  }

  async create(
    nsu: string,
    debitAccountId: number,
    creditAccountId: number,
    amountCents: bigint,
    debitBalanceCents: bigint,
    creditBalanceCents: bigint,
    description: string,
    defaultEntryId: number,
  ): Promise<Entry> {
    const entry = this.entryRepo.save({
      uuid: v4(),
      nsu,
      debit_account_id: debitAccountId,
      credit_account_id: creditAccountId,
      amount_cents: amountCents,
      debit_balance_cents: debitBalanceCents,
      credit_balance_cents: creditBalanceCents,
      description,
      default_entry_id: defaultEntryId,
    });

    return entry;
  }

  async update(entryUuid: string, description: string) {
    const entry = await this.findByUuid(entryUuid);

    if (!entry) throw ApiResponse.notFound("Entry não encontrada");

    entry.description = description;

    return this.entryRepo.save(entry);
  }

  async delete(entryUuid: string) {
    const entry = await this.findByUuid(entryUuid);

    if (!entry) throw ApiResponse.notFound("Entry não encontrada");

    return this.entryRepo.softRemove(entry);
  }
}
