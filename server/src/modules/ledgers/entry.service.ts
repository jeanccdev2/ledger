import { EntityNotFoundError } from "typeorm";
import { Entry } from "../../database/entities/entry.entity.js";
import { FindAllFilters, IEntryRepository } from "./entry.repository.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { PaginationResponse } from "../../shared/pagination.types.js";
import {
  CreateEntryBody,
  FindAllEntriesQuery,
  UpdateEntryBody,
} from "./entry.validations.js";
import { Uuid } from "../../shared/shared.validations.js";
import { ApiResponse } from "../../shared/api-response.js";
import { IDefaultEntryRepository } from "../default-entries/default-entry.repository.js";
import { IChartOfAccountRepository } from "../chart-of-accounts/chart-of-account.repository.js";
import { ICreateEntryService } from "./create-entry.service.js";

type SerializedEntry = {
  id: Uuid;
  nsu: string;
  debitAccountId: Uuid;
  creditAccountId: Uuid;
  amountCents: number;
  debitBalanceCents: number;
  creditBalanceCents: number;
  description: string | null;
  defaultEntryId: Uuid;
  createdAt: Date;
};

export interface IEntryService {
  findAll(query: FindAllEntriesQuery): Promise<{
    data: SerializedEntry[];
    pagination: PaginationResponse;
  }>;
  findByUuid(entryUuid: string): Promise<SerializedEntry | null>;
  createEntry(entry: CreateEntryBody): Promise<SerializedEntry>;
  updateEntry(
    entryUuid: Uuid,
    entry: UpdateEntryBody,
  ): Promise<SerializedEntry>;
}

@injectable()
export class EntryService implements IEntryService {
  constructor(
    @inject(TOKENS.Entries.Repository)
    private readonly entryRepository: IEntryRepository,
    @inject(TOKENS.DefaultEntries.Repository)
    private readonly defaultEntryRepository: IDefaultEntryRepository,
    @inject(TOKENS.ChartOfAccounts.Repository)
    private readonly chartOfAccountRepository: IChartOfAccountRepository,
    @inject(TOKENS.Entries.CreateEntryService)
    private readonly createEntryService: ICreateEntryService,
  ) {}

  private serializeEntry(entry: Entry | null): SerializedEntry {
    if (!entry) throw ApiResponse.notFound("Entry não encontrado");

    return {
      id: entry.uuid,
      nsu: entry.nsu,
      debitAccountId: entry.debitAccount.uuid,
      creditAccountId: entry.creditAccount.uuid,
      amountCents: Number(entry.amount_cents),
      debitBalanceCents: Number(entry.debit_balance_cents),
      creditBalanceCents: Number(entry.credit_balance_cents),
      description: entry.description,
      defaultEntryId: entry.defaultEntry.uuid,
      createdAt: entry.created_at,
    };
  }

  async findAll(query: FindAllEntriesQuery) {
    const limit = query.limit;
    const page = query.page;

    const filters: FindAllFilters = {};

    if (query.defaultEntryUuid) {
      const defaultLedger = await this.defaultEntryRepository.findByUuid(
        query.defaultEntryUuid,
      );
      if (!defaultLedger) {
        throw ApiResponse.notFound("Default ledger não encontrado");
      }
      filters.defaultEntryId = defaultLedger.id;
    }

    if (query.dateFrom) filters.dateFrom = query.dateFrom;
    if (query.dateTo) filters.dateTo = query.dateTo;
    if (query.description) filters.description = query.description;

    if (query.creditAccountUuid) {
      const chartOfAccount = await this.chartOfAccountRepository.findByUuid(
        query.creditAccountUuid,
      );
      if (!chartOfAccount) {
        throw ApiResponse.notFound("Chart of account não encontrado");
      }
      filters.creditAccountId = chartOfAccount.id;
    }

    if (query.debitAccountUuid) {
      const chartOfAccount = await this.chartOfAccountRepository.findByUuid(
        query.debitAccountUuid,
      );
      if (!chartOfAccount) {
        throw ApiResponse.notFound("Chart of account não encontrado");
      }
      filters.debitAccountId = chartOfAccount.id;
    }

    const [entries, total] = await this.entryRepository.findAll(
      limit,
      page,
      filters,
    );

    const serializedEntries = entries.map(this.serializeEntry);
    const totalRows = total;
    const totalPages = Math.ceil(totalRows / limit);

    const paginationResponse: PaginationResponse = {
      totalRows,
      totalPages,
      page,
      limit,
    };

    return {
      data: serializedEntries,
      pagination: paginationResponse,
    };
  }

  async findByUuid(entryUuid: string) {
    const entry = await this.entryRepository.findByUuid(entryUuid);

    if (!entry) return null;

    return this.serializeEntry(entry);
  }

  async createEntry(entry: CreateEntryBody) {
    const { entry: createdEntry } =
      await this.createEntryService.handleLedgerCreation(entry);

    return this.serializeEntry(createdEntry);
  }

  async updateEntry(entryUuid: Uuid, entry: UpdateEntryBody) {
    const existsEntry = await this.findByUuid(entryUuid);

    if (!existsEntry) throw ApiResponse.notFound("Entry não encontrado");

    const updatedEntry = await this.entryRepository.update(
      entryUuid,
      entry.description,
    );

    return this.serializeEntry(updatedEntry);
  }
}
