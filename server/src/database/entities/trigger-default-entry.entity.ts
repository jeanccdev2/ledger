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
import type { DefaultEntry } from "./default-entry.entity.js";

@Entity("trigger_default_entries")
export class TriggerDefaultEntry extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  @Index()
  default_entry_id!: number;

  @Column()
  @Index()
  trigger_default_entry_id!: number;

  @Column()
  status!: "active" | "inactive";

  @Column()
  order_position!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;

  @ManyToOne("DefaultEntry", { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "default_entry_id" })
  defaultEntry!: DefaultEntry;

  @ManyToOne("DefaultEntry", { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "trigger_default_entry_id" })
  triggerDefaultEntry!: DefaultEntry;
}
