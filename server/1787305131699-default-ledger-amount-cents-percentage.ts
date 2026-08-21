import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultLedgerAmountCentsPercentage1787305131699 implements MigrationInterface {
    name = 'DefaultLedgerAmountCentsPercentage1787305131699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_e739f9fb242a95d501aedde46c"`);
        await queryRunner.query(`DROP INDEX "IDX_233c2a470511f11b1564bb6cd1"`);
        await queryRunner.query(`CREATE TABLE "temporary_chart_of_accounts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "parent_id" integer, "code" varchar NOT NULL, "label" varchar NOT NULL, "nature" varchar NOT NULL, "type" varchar NOT NULL, "status" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "uuid" varchar NOT NULL, CONSTRAINT "UQ_e739f9fb242a95d501aedde46c8" UNIQUE ("code"), CONSTRAINT "UQ_4c20b32dceb8fe73594a08731be" UNIQUE ("uuid"), CONSTRAINT "FK_233c2a470511f11b1564bb6cd1e" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_chart_of_accounts"("id", "parent_id", "code", "label", "nature", "type", "status", "created_at", "updated_at", "deleted_at") SELECT "id", "parent_id", "code", "label", "nature", "type", "status", "created_at", "updated_at", "deleted_at" FROM "chart_of_accounts"`);
        await queryRunner.query(`DROP TABLE "chart_of_accounts"`);
        await queryRunner.query(`ALTER TABLE "temporary_chart_of_accounts" RENAME TO "chart_of_accounts"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e739f9fb242a95d501aedde46c" ON "chart_of_accounts" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_233c2a470511f11b1564bb6cd1" ON "chart_of_accounts" ("parent_id") `);
        await queryRunner.query(`DROP INDEX "IDX_288e5721c7b9bcae19b8fdb056"`);
        await queryRunner.query(`DROP INDEX "IDX_1c9d7edd78ffc1c70c678aadd6"`);
        await queryRunner.query(`CREATE TABLE "temporary_trigger_default_entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "default_entry_id" integer NOT NULL, "trigger_default_entry_id" integer NOT NULL, "status" varchar NOT NULL, "order_position" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "amount_cents" integer, "percentage" float, CONSTRAINT "FK_288e5721c7b9bcae19b8fdb0567" FOREIGN KEY ("trigger_default_entry_id") REFERENCES "default_entries" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_1c9d7edd78ffc1c70c678aadd69" FOREIGN KEY ("default_entry_id") REFERENCES "default_entries" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_trigger_default_entries"("id", "name", "default_entry_id", "trigger_default_entry_id", "status", "order_position", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "default_entry_id", "trigger_default_entry_id", "status", "order_position", "created_at", "updated_at", "deleted_at" FROM "trigger_default_entries"`);
        await queryRunner.query(`DROP TABLE "trigger_default_entries"`);
        await queryRunner.query(`ALTER TABLE "temporary_trigger_default_entries" RENAME TO "trigger_default_entries"`);
        await queryRunner.query(`CREATE INDEX "IDX_288e5721c7b9bcae19b8fdb056" ON "trigger_default_entries" ("trigger_default_entry_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c9d7edd78ffc1c70c678aadd6" ON "trigger_default_entries" ("default_entry_id") `);
        await queryRunner.query(`DROP INDEX "IDX_48f99ad289482333f192398191"`);
        await queryRunner.query(`DROP INDEX "IDX_21ec389fcf8af3d1fbb2982163"`);
        await queryRunner.query(`CREATE TABLE "temporary_default_entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "account_debit_id" integer, "account_credit_id" integer, "status" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "uuid" varchar NOT NULL, "amount_cents" integer, CONSTRAINT "UQ_b9158a59debf129c687a30e9574" UNIQUE ("uuid"), CONSTRAINT "FK_48f99ad289482333f192398191f" FOREIGN KEY ("account_credit_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_21ec389fcf8af3d1fbb29821637" FOREIGN KEY ("account_debit_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_default_entries"("id", "name", "account_debit_id", "account_credit_id", "status", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "account_debit_id", "account_credit_id", "status", "created_at", "updated_at", "deleted_at" FROM "default_entries"`);
        await queryRunner.query(`DROP TABLE "default_entries"`);
        await queryRunner.query(`ALTER TABLE "temporary_default_entries" RENAME TO "default_entries"`);
        await queryRunner.query(`CREATE INDEX "IDX_48f99ad289482333f192398191" ON "default_entries" ("account_credit_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_21ec389fcf8af3d1fbb2982163" ON "default_entries" ("account_debit_id") `);
        await queryRunner.query(`DROP INDEX "IDX_97f4793c4fe18fd12160dddb49"`);
        await queryRunner.query(`DROP INDEX "IDX_c899d21e749a292e4ff6aa8c51"`);
        await queryRunner.query(`DROP INDEX "IDX_6e0834c378596e77042b4eb120"`);
        await queryRunner.query(`DROP INDEX "IDX_703dbd0b0ffd562cd89fa06f78"`);
        await queryRunner.query(`DROP INDEX "IDX_12ff3b11898350ade937670521"`);
        await queryRunner.query(`CREATE TABLE "temporary_entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "nsu" varchar NOT NULL, "debit_account_id" integer NOT NULL, "credit_account_id" integer NOT NULL, "amount_cents" bigint NOT NULL, "debit_balance_cents" bigint NOT NULL, "credit_balance_cents" bigint NOT NULL, "description" text, "default_entry_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "uuid" varchar NOT NULL, CONSTRAINT "UQ_12ff3b11898350ade9376705217" UNIQUE ("nsu"), CONSTRAINT "UQ_773e8281f121ad2bbdeb8c67291" UNIQUE ("uuid"), CONSTRAINT "FK_c899d21e749a292e4ff6aa8c51f" FOREIGN KEY ("default_entry_id") REFERENCES "default_entries" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_6e0834c378596e77042b4eb1207" FOREIGN KEY ("credit_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_703dbd0b0ffd562cd89fa06f788" FOREIGN KEY ("debit_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_entries"("id", "nsu", "debit_account_id", "credit_account_id", "amount_cents", "debit_balance_cents", "credit_balance_cents", "description", "default_entry_id", "created_at") SELECT "id", "nsu", "debit_account_id", "credit_account_id", "amount_cents", "debit_balance_cents", "credit_balance_cents", "description", "default_entry_id", "created_at" FROM "entries"`);
        await queryRunner.query(`DROP TABLE "entries"`);
        await queryRunner.query(`ALTER TABLE "temporary_entries" RENAME TO "entries"`);
        await queryRunner.query(`CREATE INDEX "IDX_97f4793c4fe18fd12160dddb49" ON "entries" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_c899d21e749a292e4ff6aa8c51" ON "entries" ("default_entry_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6e0834c378596e77042b4eb120" ON "entries" ("credit_account_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_703dbd0b0ffd562cd89fa06f78" ON "entries" ("debit_account_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_12ff3b11898350ade937670521" ON "entries" ("nsu") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_12ff3b11898350ade937670521"`);
        await queryRunner.query(`DROP INDEX "IDX_703dbd0b0ffd562cd89fa06f78"`);
        await queryRunner.query(`DROP INDEX "IDX_6e0834c378596e77042b4eb120"`);
        await queryRunner.query(`DROP INDEX "IDX_c899d21e749a292e4ff6aa8c51"`);
        await queryRunner.query(`DROP INDEX "IDX_97f4793c4fe18fd12160dddb49"`);
        await queryRunner.query(`ALTER TABLE "entries" RENAME TO "temporary_entries"`);
        await queryRunner.query(`CREATE TABLE "entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "nsu" varchar NOT NULL, "debit_account_id" integer NOT NULL, "credit_account_id" integer NOT NULL, "amount_cents" bigint NOT NULL, "debit_balance_cents" bigint NOT NULL, "credit_balance_cents" bigint NOT NULL, "description" text, "default_entry_id" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_12ff3b11898350ade9376705217" UNIQUE ("nsu"), CONSTRAINT "FK_c899d21e749a292e4ff6aa8c51f" FOREIGN KEY ("default_entry_id") REFERENCES "default_entries" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_6e0834c378596e77042b4eb1207" FOREIGN KEY ("credit_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_703dbd0b0ffd562cd89fa06f788" FOREIGN KEY ("debit_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "entries"("id", "nsu", "debit_account_id", "credit_account_id", "amount_cents", "debit_balance_cents", "credit_balance_cents", "description", "default_entry_id", "created_at") SELECT "id", "nsu", "debit_account_id", "credit_account_id", "amount_cents", "debit_balance_cents", "credit_balance_cents", "description", "default_entry_id", "created_at" FROM "temporary_entries"`);
        await queryRunner.query(`DROP TABLE "temporary_entries"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_12ff3b11898350ade937670521" ON "entries" ("nsu") `);
        await queryRunner.query(`CREATE INDEX "IDX_703dbd0b0ffd562cd89fa06f78" ON "entries" ("debit_account_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6e0834c378596e77042b4eb120" ON "entries" ("credit_account_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c899d21e749a292e4ff6aa8c51" ON "entries" ("default_entry_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_97f4793c4fe18fd12160dddb49" ON "entries" ("created_at") `);
        await queryRunner.query(`DROP INDEX "IDX_21ec389fcf8af3d1fbb2982163"`);
        await queryRunner.query(`DROP INDEX "IDX_48f99ad289482333f192398191"`);
        await queryRunner.query(`ALTER TABLE "default_entries" RENAME TO "temporary_default_entries"`);
        await queryRunner.query(`CREATE TABLE "default_entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "account_debit_id" integer, "account_credit_id" integer, "status" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, CONSTRAINT "FK_48f99ad289482333f192398191f" FOREIGN KEY ("account_credit_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_21ec389fcf8af3d1fbb29821637" FOREIGN KEY ("account_debit_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "default_entries"("id", "name", "account_debit_id", "account_credit_id", "status", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "account_debit_id", "account_credit_id", "status", "created_at", "updated_at", "deleted_at" FROM "temporary_default_entries"`);
        await queryRunner.query(`DROP TABLE "temporary_default_entries"`);
        await queryRunner.query(`CREATE INDEX "IDX_21ec389fcf8af3d1fbb2982163" ON "default_entries" ("account_debit_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_48f99ad289482333f192398191" ON "default_entries" ("account_credit_id") `);
        await queryRunner.query(`DROP INDEX "IDX_1c9d7edd78ffc1c70c678aadd6"`);
        await queryRunner.query(`DROP INDEX "IDX_288e5721c7b9bcae19b8fdb056"`);
        await queryRunner.query(`ALTER TABLE "trigger_default_entries" RENAME TO "temporary_trigger_default_entries"`);
        await queryRunner.query(`CREATE TABLE "trigger_default_entries" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "default_entry_id" integer NOT NULL, "trigger_default_entry_id" integer NOT NULL, "status" varchar NOT NULL, "order_position" integer NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, CONSTRAINT "FK_288e5721c7b9bcae19b8fdb0567" FOREIGN KEY ("trigger_default_entry_id") REFERENCES "default_entries" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_1c9d7edd78ffc1c70c678aadd69" FOREIGN KEY ("default_entry_id") REFERENCES "default_entries" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "trigger_default_entries"("id", "name", "default_entry_id", "trigger_default_entry_id", "status", "order_position", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "default_entry_id", "trigger_default_entry_id", "status", "order_position", "created_at", "updated_at", "deleted_at" FROM "temporary_trigger_default_entries"`);
        await queryRunner.query(`DROP TABLE "temporary_trigger_default_entries"`);
        await queryRunner.query(`CREATE INDEX "IDX_1c9d7edd78ffc1c70c678aadd6" ON "trigger_default_entries" ("default_entry_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_288e5721c7b9bcae19b8fdb056" ON "trigger_default_entries" ("trigger_default_entry_id") `);
        await queryRunner.query(`DROP INDEX "IDX_233c2a470511f11b1564bb6cd1"`);
        await queryRunner.query(`DROP INDEX "IDX_e739f9fb242a95d501aedde46c"`);
        await queryRunner.query(`ALTER TABLE "chart_of_accounts" RENAME TO "temporary_chart_of_accounts"`);
        await queryRunner.query(`CREATE TABLE "chart_of_accounts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "parent_id" integer, "code" varchar NOT NULL, "label" varchar NOT NULL, "nature" varchar NOT NULL, "type" varchar NOT NULL, "status" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, CONSTRAINT "UQ_e739f9fb242a95d501aedde46c8" UNIQUE ("code"), CONSTRAINT "FK_233c2a470511f11b1564bb6cd1e" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "chart_of_accounts"("id", "parent_id", "code", "label", "nature", "type", "status", "created_at", "updated_at", "deleted_at") SELECT "id", "parent_id", "code", "label", "nature", "type", "status", "created_at", "updated_at", "deleted_at" FROM "temporary_chart_of_accounts"`);
        await queryRunner.query(`DROP TABLE "temporary_chart_of_accounts"`);
        await queryRunner.query(`CREATE INDEX "IDX_233c2a470511f11b1564bb6cd1" ON "chart_of_accounts" ("parent_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e739f9fb242a95d501aedde46c" ON "chart_of_accounts" ("code") `);
    }

}
