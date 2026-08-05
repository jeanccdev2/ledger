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
import { Holder } from "./holder.entity.js";
import { ChartOfAccount } from "./chart-of-account.entity.js";

@Entity("holder_accounts")
export class HolderAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  holder_id!: number;

  @Column()
  @Index({ unique: true })
  chart_of_account_id!: number;

  @Column()
  status!: "active" | "inactive";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;

  @ManyToOne(() => Holder, (holder) => holder.holderAccounts, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "holder_id" })
  holder!: Holder;

  @OneToOne(
    () => ChartOfAccount,
    (chartOfAccount) => chartOfAccount.holderAccount,
  )
  @JoinColumn({ name: "chart_of_account_id" })
  chartOfAccount!: ChartOfAccount;
}
