import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import type { HolderAccount } from "./holder-account.entity.js";

@Entity("holders")
export class Holder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  @Index({ unique: true })
  external_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;

  @OneToMany("HolderAccount", (holderAccount: HolderAccount) => holderAccount.holder)
  holderAccounts!: HolderAccount[];
}
