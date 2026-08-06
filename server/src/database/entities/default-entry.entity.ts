import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { ChartOfAccount } from "./chart-of-account.entity.js";

@Entity("default_entries")
export class DefaultEntry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  @Index()
  account_debit_id?: number | null;

  @Column({ nullable: true })
  @Index()
  account_credit_id?: number | null;

  @Column()
  status!: "active" | "inactive";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;

  @ManyToOne("ChartOfAccount", { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "account_debit_id" })
  accountDebit?: ChartOfAccount | null;

  @ManyToOne("ChartOfAccount", { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "account_credit_id" })
  accountCredit?: ChartOfAccount | null;
}
