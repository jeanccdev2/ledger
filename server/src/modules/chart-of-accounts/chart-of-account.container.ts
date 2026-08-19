import { container } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { ChartOfAccountRepository } from "./chart-of-account.repository.js";

export function registerChartOfAccountsProvider(): void {
  container.registerSingleton(
    TOKENS.ChartOfAccounts.Repository,
    ChartOfAccountRepository,
  );
}
