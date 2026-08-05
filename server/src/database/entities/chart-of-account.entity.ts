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
import { HolderAccount } from "./holder-account.entity.js";
import { Entry } from "./entry.entity.js";

@Entity("chart_of_accounts")
export class ChartOfAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  @Index()
  parent_id!: number | null;

  @Column({ unique: true })
  @Index({ unique: true })
  code!: string;

  @Column()
  label!: string;

  @Column()
  nature!: "debit" | "credit";

  @Column()
  type!: "synthetic" | "analytical";

  @Column()
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
    () => HolderAccount,
    (holderAccount) => holderAccount.chartOfAccount,
  )
  holderAccount!: HolderAccount | null;

  @OneToMany(() => Entry, (entry) => entry.debitAccount)
  debitEntries!: Entry[];

  @OneToMany(() => Entry, (entry) => entry.creditAccount)
  creditEntries!: Entry[];
}
