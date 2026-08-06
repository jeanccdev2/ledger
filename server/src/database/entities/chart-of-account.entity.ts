import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { HolderAccount } from "./holder-account.entity.js";
import type { Entry } from "./entry.entity.js";

@Entity("chart_of_accounts")
export class ChartOfAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "integer", nullable: true })
  @Index()
  parent_id!: number | null;

  @Column({ type: "varchar", unique: true })
  @Index({ unique: true })
  code!: string;

  @Column({ type: "varchar" })
  label!: string;

  @Column({ type: "varchar" })
  nature!: "debit" | "credit";

  @Column({ type: "varchar" })
  type!: "synthetic" | "analytical";

  @Column({ type: "varchar" })
  status!: "active" | "inactive";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;

  @ManyToOne(
    () => ChartOfAccount,
    (chartOfAccount) => chartOfAccount.children,
    {
      nullable: true,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "parent_id" })
  parent!: ChartOfAccount | null;

  @OneToMany(() => ChartOfAccount, (chartOfAccount) => chartOfAccount.parent)
  children!: ChartOfAccount[];

  @OneToOne(
    "HolderAccount",
    (holderAccount: HolderAccount) => holderAccount.chartOfAccount,
  )
  holderAccount!: HolderAccount | null;

  @OneToMany("Entry", (entry: Entry) => entry.debitAccount)
  debitEntries!: Entry[];

  @OneToMany("Entry", (entry: Entry) => entry.creditAccount)
  creditEntries!: Entry[];
}
