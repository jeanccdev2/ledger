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
import type { ChartOfAccount } from "./chart-of-account.entity.js";
import type { DefaultEntry } from "./default-entry.entity.js";
import { Uuid } from "../../shared/shared.validations.js";

@Entity("entries")
export class Entry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
  })
  uuid!: Uuid;

  @Column({
    type: "varchar",
    unique: true,
  })
  @Index({ unique: true })
  nsu!: string;

  @Column({ type: "integer" })
  @Index()
  debit_account_id!: number;

  @Column({ type: "integer" })
  @Index()
  credit_account_id!: number;

  @Column({
    type: "bigint",
  })
  amount_cents!: bigint;

  @Column({
    type: "bigint",
  })
  debit_balance_cents!: bigint;

  @Column({
    type: "bigint",
  })
  credit_balance_cents!: bigint;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({ type: "integer" })
  @Index()
  default_entry_id!: number;

  @CreateDateColumn()
  @Index()
  created_at!: Date;

  @ManyToOne(
    "ChartOfAccount",
    (chartOfAccount: ChartOfAccount) => chartOfAccount.debitEntries,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "debit_account_id" })
  debitAccount!: ChartOfAccount;

  @ManyToOne(
    "ChartOfAccount",
    (chartOfAccount: ChartOfAccount) => chartOfAccount.creditEntries,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "credit_account_id" })
  creditAccount!: ChartOfAccount;

  @ManyToOne("DefaultEntry", {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "default_entry_id" })
  defaultEntry!: DefaultEntry;
}
