import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { IDefaultEntryRepository } from "./default-entry.repository.js";
import { IChartOfAccountRepository } from "../chart-of-accounts/chart-of-account.repository.js";
import { dataSource } from "../../database/datasource.js";
import { DefaultEntry } from "../../database/entities/default-entry.entity.js";
import { TriggerDefaultEntry } from "../../database/entities/trigger-default-entry.entity.js";
import { ApiResponse } from "../../shared/api-response.js";
import { PaginationResponse } from "../../shared/pagination.types.js";
import {
  CreateDefaultEntryBody,
  FindAllDefaultEntriesQuery,
  UpdateDefaultEntryBody,
} from "./default-entries.validations.js";
import { Uuid } from "../../shared/shared.validations.js";

type SerializedTriggerEntry = {
  name: string;
  status: "active" | "inactive";
  orderPosition: number;
  amountCents: number | null;
  percentage: number | null;
  triggerDefaultEntry: {
    id: Uuid;
    name: string;
  };
};

type SerializedDefaultEntry = {
  id: Uuid;
  name: string;
  status: "active" | "inactive";
  amountCents: number | null;
  accountDebit: {
    id: Uuid;
    code: string;
    label: string;
  } | null;
  accountCredit: {
    id: Uuid;
    code: string;
    label: string;
  } | null;
  triggerEntries: SerializedTriggerEntry[];
  createdAt: Date;
  updatedAt: Date;
};

export interface IDefaultEntryService {
  findAll(query: FindAllDefaultEntriesQuery): Promise<{
    data: SerializedDefaultEntry[];
    pagination: PaginationResponse;
  }>;
  findByUuid(defaultEntryUuid: string): Promise<SerializedDefaultEntry | null>;
  createDefaultEntry(body: CreateDefaultEntryBody): Promise<SerializedDefaultEntry>;
  updateDefaultEntry(
    defaultEntryUuid: string,
    body: UpdateDefaultEntryBody,
  ): Promise<SerializedDefaultEntry>;
  deleteDefaultEntry(defaultEntryUuid: string): Promise<SerializedDefaultEntry>;
}

@injectable()
export class DefaultEntryService implements IDefaultEntryService {
  constructor(
    @inject(TOKENS.DefaultEntries.Repository)
    private readonly defaultEntryRepository: IDefaultEntryRepository,
    @inject(TOKENS.ChartOfAccounts.Repository)
    private readonly chartOfAccountRepository: IChartOfAccountRepository,
  ) {}

  private serializeDefaultEntry(entry: DefaultEntry | null): SerializedDefaultEntry {
    if (!entry) throw ApiResponse.notFound("Default entry não encontrado");

    return {
      id: entry.uuid,
      name: entry.name,
      status: entry.status,
      amountCents: entry.amount_cents ?? null,
      accountDebit: entry.accountDebit
        ? {
            id: entry.accountDebit.uuid,
            code: entry.accountDebit.code,
            label: entry.accountDebit.label,
          }
        : null,
      accountCredit: entry.accountCredit
        ? {
            id: entry.accountCredit.uuid,
            code: entry.accountCredit.code,
            label: entry.accountCredit.label,
          }
        : null,
      triggerEntries: (entry.triggerEntries ?? []).map((t) => ({
        name: t.name,
        status: t.status,
        orderPosition: t.order_position,
        amountCents: t.amount_cents ?? null,
        percentage: t.percentage ?? null,
        triggerDefaultEntry: {
          id: t.triggerDefaultEntry.uuid,
          name: t.triggerDefaultEntry.name,
        },
      })),
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    };
  }

  async findAll(query: FindAllDefaultEntriesQuery) {
    const limit = query.limit;
    const page = query.page;
    const offset = (page - 1) * limit;

    const [entries, totalRows] = await this.defaultEntryRepository.findAll(
      limit,
      offset,
      query.name,
      query.status,
    );

    const serializedEntries = entries.map((e) => this.serializeDefaultEntry(e));
    const totalPages = Math.ceil(totalRows / limit);

    return {
      data: serializedEntries,
      pagination: {
        totalRows,
        totalPages,
        page,
        limit,
      },
    };
  }

  async findByUuid(defaultEntryUuid: string) {
    const entry = await this.defaultEntryRepository.findByUuid(defaultEntryUuid);
    if (!entry) return null;
    return this.serializeDefaultEntry(entry);
  }

  async createDefaultEntry(body: CreateDefaultEntryBody) {
    return dataSource.transaction(async (manager) => {
      // Configure repos with transactional entity manager
      const defaultEntryRepoTx = this.defaultEntryRepository;
      defaultEntryRepoTx.setManager(manager);
      const chartOfAccountRepoTx = this.chartOfAccountRepository;
      chartOfAccountRepoTx.setManager(manager);

      // Resolve Debit and Credit accounts
      let account_debit_id: number | null = null;
      if (body.accountDebitUuid) {
        const account = await chartOfAccountRepoTx.findByUuid(body.accountDebitUuid);
        if (!account) throw ApiResponse.badRequest("Account Debit not found");
        account_debit_id = account.id;
      }

      let account_credit_id: number | null = null;
      if (body.accountCreditUuid) {
        const account = await chartOfAccountRepoTx.findByUuid(body.accountCreditUuid);
        if (!account) throw ApiResponse.badRequest("Account Credit not found");
        account_credit_id = account.id;
      }

      // Save Default Entry
      const entry = await defaultEntryRepoTx.save({
        name: body.name,
        account_debit_id,
        account_credit_id,
        status: body.status,
        amount_cents: body.amountCents ?? null,
      });

      // Save Triggers if provided
      if (body.triggerEntries && body.triggerEntries.length > 0) {
        const triggersToSave: Array<Partial<TriggerDefaultEntry>> = [];

        for (const t of body.triggerEntries) {
          const triggerTarget = await defaultEntryRepoTx.findByUuid(
            t.triggerDefaultEntryUuid,
            {},
          );
          if (!triggerTarget) {
            throw ApiResponse.badRequest(
              `Trigger target DefaultEntry with UUID ${t.triggerDefaultEntryUuid} not found`,
            );
          }

          triggersToSave.push({
            name: t.name,
            trigger_default_entry_id: triggerTarget.id,
            status: t.status,
            order_position: t.orderPosition,
            amount_cents: t.amountCents ?? null,
            percentage: t.percentage ?? null,
          });
        }

        await defaultEntryRepoTx.saveTriggerEntries(entry.id, triggersToSave);
      }

      // Fetch the saved entity with all relations
      const finalEntry = await defaultEntryRepoTx.findByUuid(entry.uuid);
      return this.serializeDefaultEntry(finalEntry);
    });
  }

  async updateDefaultEntry(defaultEntryUuid: string, body: UpdateDefaultEntryBody) {
    return dataSource.transaction(async (manager) => {
      // Configure repos with transactional entity manager
      const defaultEntryRepoTx = this.defaultEntryRepository;
      defaultEntryRepoTx.setManager(manager);
      const chartOfAccountRepoTx = this.chartOfAccountRepository;
      chartOfAccountRepoTx.setManager(manager);

      const entry = await defaultEntryRepoTx.findByUuid(defaultEntryUuid);
      if (!entry) throw ApiResponse.notFound("Default entry não encontrado");

      // Resolve Debit and Credit accounts
      if (body.accountDebitUuid !== undefined) {
        if (body.accountDebitUuid === null) {
          entry.account_debit_id = null;
        } else {
          const account = await chartOfAccountRepoTx.findByUuid(body.accountDebitUuid);
          if (!account) throw ApiResponse.badRequest("Account Debit not found");
          entry.account_debit_id = account.id;
        }
      }

      if (body.accountCreditUuid !== undefined) {
        if (body.accountCreditUuid === null) {
          entry.account_credit_id = null;
        } else {
          const account = await chartOfAccountRepoTx.findByUuid(body.accountCreditUuid);
          if (!account) throw ApiResponse.badRequest("Account Credit not found");
          entry.account_credit_id = account.id;
        }
      }

      if (body.name !== undefined) entry.name = body.name;
      if (body.status !== undefined) entry.status = body.status;
      if (body.amountCents !== undefined) entry.amount_cents = body.amountCents;

      // Save updated base entity
      await defaultEntryRepoTx.save(entry);

      // Handle triggers update if provided
      if (body.triggerEntries !== undefined) {
        // Clear existing trigger entries
        await defaultEntryRepoTx.clearTriggerEntries(entry.id);

        if (body.triggerEntries.length > 0) {
          const triggersToSave: Array<Partial<TriggerDefaultEntry>> = [];

          for (const t of body.triggerEntries) {
            const triggerTarget = await defaultEntryRepoTx.findByUuid(
              t.triggerDefaultEntryUuid,
              {},
            );
            if (!triggerTarget) {
              throw ApiResponse.badRequest(
                `Trigger target DefaultEntry with UUID ${t.triggerDefaultEntryUuid} not found`,
              );
            }

            triggersToSave.push({
              name: t.name,
              trigger_default_entry_id: triggerTarget.id,
              status: t.status,
              order_position: t.orderPosition,
              amount_cents: t.amountCents ?? null,
              percentage: t.percentage ?? null,
            });
          }

          await defaultEntryRepoTx.saveTriggerEntries(entry.id, triggersToSave);
        }
      }

      // Fetch final state with relations
      const finalEntry = await defaultEntryRepoTx.findByUuid(entry.uuid);
      return this.serializeDefaultEntry(finalEntry);
    });
  }

  async deleteDefaultEntry(defaultEntryUuid: string) {
    const entry = await this.defaultEntryRepository.findByUuid(defaultEntryUuid);
    if (!entry) throw ApiResponse.notFound("Default entry não encontrado");

    await this.defaultEntryRepository.delete(defaultEntryUuid);

    return this.serializeDefaultEntry(entry);
  }
}
