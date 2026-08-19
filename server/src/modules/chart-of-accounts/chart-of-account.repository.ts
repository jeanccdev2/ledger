import { Repository } from "typeorm";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";
import { ChartOfAccount } from "../../database/entities/chart-of-account.entity.js";

export interface IChartOfAccountRepository {
  findByUuid(chartOfAccountUuid: string): Promise<ChartOfAccount | null>;
}

@injectable()
export class ChartOfAccountRepository implements IChartOfAccountRepository {
  private chartOfAccountRepo: Repository<ChartOfAccount>;

  constructor() {
    this.chartOfAccountRepo = dataSource.getRepository(ChartOfAccount);
  }

  async findByUuid(chartOfAccountUuid: string) {
    return this.chartOfAccountRepo.findOneBy({
      uuid: chartOfAccountUuid,
    });
  }
}
