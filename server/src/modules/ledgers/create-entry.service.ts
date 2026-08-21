import { IEntryRepository } from "./entry.repository.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { CreateEntryBody } from "./entry.validations.js";
import { ApiResponse } from "../../shared/api-response.js";
import { IDefaultEntryRepository } from "../default-entries/default-entry.repository.js";
import { IChartOfAccountRepository } from "../chart-of-accounts/chart-of-account.repository.js";
import { DefaultEntry } from "../../database/entities/default-entry.entity.js";
import { TriggerDefaultEntry } from "../../database/entities/trigger-default-entry.entity.js";
import { env } from "../../shared/env.js";
import { dataSource } from "../../database/datasource.js";
import { Entry } from "../../database/entities/entry.entity.js";

export interface ICreateEntryService {
  handleLedgerCreation(
    entry: CreateEntryBody,
  ): Promise<{ entry: Entry; triggers: Entry[] }>;
}

@injectable()
export class CreateEntryService implements ICreateEntryService {
  private payload!: CreateEntryBody;
  private defaultEntry!: DefaultEntry;
  private triggersDefaultEntry!: TriggerDefaultEntry[];

  constructor(
    @inject(TOKENS.Entries.Repository)
    private readonly entryRepository: IEntryRepository,
    @inject(TOKENS.DefaultEntries.Repository)
    private readonly defaultEntryRepository: IDefaultEntryRepository,
    @inject(TOKENS.ChartOfAccounts.Repository)
    private readonly chartOfAccountRepository: IChartOfAccountRepository,
  ) {}

  async handleLedgerCreation(
    entry: CreateEntryBody,
  ): Promise<{ entry: Entry; triggers: Entry[] }> {
    return await dataSource.transaction(async (manager) => {
      this.payload = entry;

      this.entryRepository.setManager(manager);
      this.defaultEntryRepository.setManager(manager);
      this.chartOfAccountRepository.setManager(manager);

      await this.loadDefaultEntries();
      const createdEntry = await this.createEntry();
      const triggers = await this.createTriggersEntries();

      return {
        entry: createdEntry,
        triggers,
      };
    });
  }

  private assertEnoughBalance(lastBalance: number, amountCents: number) {
    if (env.ACCEPT_NEGATIVE_BALANCE) return;

    if (lastBalance - amountCents < 0) {
      throw ApiResponse.badRequest("Saldo insuficiente");
    }
  }

  private async loadDefaultEntries() {
    const defaultEntry = await this.defaultEntryRepository.findByUuid(
      this.payload.defaultEntryUuid,
    );
    if (!defaultEntry) {
      throw ApiResponse.notFound("Default entry não encontrado");
    }

    this.defaultEntry = defaultEntry;
    this.triggersDefaultEntry = (defaultEntry.triggerEntries || [])
      .filter((trigger) => trigger.status === "active")
      .sort((a, b) => a.order_position - b.order_position);
  }

  private async createEntry(entry?: CreateEntryBody): Promise<Entry> {
    const chartOfAccountCredit = await this.chartOfAccountRepository.findByUuid(
      entry?.creditAccountUuid || this.payload.creditAccountUuid,
    );
    if (!chartOfAccountCredit) {
      throw ApiResponse.notFound("Chart of account credit não encontrado");
    }

    const chartOfAccountDebit = await this.chartOfAccountRepository.findByUuid(
      entry?.debitAccountUuid || this.payload.debitAccountUuid,
    );
    if (!chartOfAccountDebit) {
      throw ApiResponse.notFound("Chart of account debit não encontrado");
    }

    const defaultEntry = await this.defaultEntryRepository.findByUuid(
      entry?.defaultEntryUuid || this.payload.defaultEntryUuid,
    );
    if (!defaultEntry) {
      throw ApiResponse.notFound("Default entry não encontrado");
    }

    const lastBalanceDebit =
      (await this.chartOfAccountRepository.getLastBalance(
        chartOfAccountDebit.id,
      )) || 0;
    const lastBalanceCredit =
      (await this.chartOfAccountRepository.getLastBalance(
        chartOfAccountCredit.id,
      )) || 0;

    const amountCents =
      entry?.amountCents ||
      this.payload.amountCents ||
      defaultEntry.amount_cents ||
      this.defaultEntry.amount_cents;
    if (!amountCents) {
      throw ApiResponse.badRequest("Amount Cents is required");
    }

    if (chartOfAccountDebit.nature == "credit") {
      this.assertEnoughBalance(lastBalanceDebit, amountCents);
    } else if (chartOfAccountCredit.nature == "debit") {
      this.assertEnoughBalance(lastBalanceCredit, amountCents);
    }

    if (chartOfAccountDebit.type != "analytical") {
      throw ApiResponse.badRequest("Chart of account debit is not analytical");
    }

    if (chartOfAccountCredit.type != "analytical") {
      throw ApiResponse.badRequest("Chart of account credit is not analytical");
    }

    return await this.entryRepository.create(
      entry?.nsu || this.payload.nsu,
      chartOfAccountDebit.id,
      chartOfAccountCredit.id,
      BigInt(amountCents),
      BigInt((lastBalanceDebit || 0) + amountCents),
      BigInt((lastBalanceCredit || 0) + amountCents),
      entry?.description || this.payload.description || null,
      this.defaultEntry.id,
    );
  }

  private async createTriggersEntries() {
    const triggersEntries: Entry[] = [];

    for (const trigger of this.triggersDefaultEntry) {
      let amountCents: number | null = null;

      if (trigger.amount_cents) {
        amountCents = trigger.amount_cents;
      } else if (trigger.percentage && this.payload.amountCents) {
        amountCents = (trigger.percentage * this.payload.amountCents) / 100;
      }

      triggersEntries.push(
        await this.createEntry({
          nsu: this.payload.nsu,
          debitAccountUuid:
            trigger.triggerDefaultEntry.accountDebit?.uuid ||
            this.payload.debitAccountUuid,
          creditAccountUuid:
            trigger.triggerDefaultEntry.accountCredit?.uuid ||
            this.payload.creditAccountUuid,
          defaultEntryUuid: trigger.triggerDefaultEntry.uuid,
          amountCents,
          description: this.payload.description || null,
        }),
      );
    }

    return triggersEntries;
  }
}
