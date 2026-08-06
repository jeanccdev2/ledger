import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import type { Holder } from "./holder.entity.js";
import type { ChartOfAccount } from "./chart-of-account.entity.js";

@Entity("holder_accounts")
export class HolderAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "integer" })
  @Index()
  holder_id!: number;

  @Column({ type: "integer" })
  @Index({ unique: true })
  chart_of_account_id!: number;

  @Column({ type: "varchar" })
  status!: "active" | "inactive";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;

  @ManyToOne("Holder", (holder: Holder) => holder.holderAccounts, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "holder_id" })
  holder!: Holder;

  @OneToOne(
    "ChartOfAccount",
    (chartOfAccount: ChartOfAccount) => chartOfAccount.holderAccount,
  )
  @JoinColumn({ name: "chart_of_account_id" })
  chartOfAccount!: ChartOfAccount;
}
