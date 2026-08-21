import { EntityManager, Repository } from "typeorm";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";
import { ChartOfAccount } from "../../database/entities/chart-of-account.entity.js";
import { Entry } from "../../database/entities/entry.entity.js";

export interface IChartOfAccountRepository {
  setManager(manager: EntityManager): void;
  findByUuid(chartOfAccountUuid: string): Promise<ChartOfAccount | null>;
  getLastBalance(chartOfAccountId: number): Promise<number | null>;
}

@injectable()
export class ChartOfAccountRepository implements IChartOfAccountRepository {
  private chartOfAccountRepo: Repository<ChartOfAccount>;
  private entryRepo: Repository<Entry>;

  constructor() {
    this.chartOfAccountRepo = dataSource.getRepository(ChartOfAccount);
    this.entryRepo = dataSource.getRepository(Entry);
  }

  setManager(manager: EntityManager): void {
    this.chartOfAccountRepo = manager.getRepository(ChartOfAccount);
    this.entryRepo = manager.getRepository(Entry);
  }

  async findByUuid(chartOfAccountUuid: string) {
    return this.chartOfAccountRepo.findOneBy({
      uuid: chartOfAccountUuid,
    });
  }

  async getLastBalance(chartOfAccountId: number): Promise<number | null> {
    const lastEntry = await this.entryRepo.findOne({
      where: {
        credit_account_id: chartOfAccountId,
        debit_account_id: chartOfAccountId,
      },
      order: {
        created_at: "DESC",
      },
    });

    if (lastEntry) {
      return Number(
        lastEntry.debit_account_id === chartOfAccountId
          ? lastEntry.debit_balance_cents
          : lastEntry.credit_balance_cents,
      );
    }

    return null;
  }
}
