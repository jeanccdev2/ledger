import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChartOfAccount } from "./chart-of-account.entity.js";
import { DefaultEntry } from "./default-entry.entity.js";

@Entity("entries")
export class Entry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  @Index({ unique: true })
  nsu!: string;

  @Column()
  @Index()
  debit_account_id!: number;

  @Column()
  @Index()
  credit_account_id!: number;

  @Column({
    type: "bigint",
  })
  amount_cents!: string;

  @Column({
    type: "bigint",
  })
  debit_balance_cents!: string;

  @Column({
    type: "bigint",
  })
  credit_balance_cents!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column()
  @Index()
  default_entry_id!: number;

  @CreateDateColumn()
  @Index()
  created_at!: Date;

  @ManyToOne(
    () => ChartOfAccount,
    (chartOfAccount) => chartOfAccount.debitEntries,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "debit_account_id" })
  debitAccount!: ChartOfAccount;

  @ManyToOne(
    () => ChartOfAccount,
    (chartOfAccount) => chartOfAccount.creditEntries,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "credit_account_id" })
  creditAccount!: ChartOfAccount;

  @ManyToOne(() => DefaultEntry, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "default_entry_id" })
  defaultEntry!: DefaultEntry;
}
