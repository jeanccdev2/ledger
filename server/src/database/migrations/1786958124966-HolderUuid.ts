import { MigrationInterface, QueryRunner } from "typeorm";

export class HolderUuid1786958124966 implements MigrationInterface {
    name = 'HolderUuid1786958124966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_6e596ebc90e2e21512e60a85e0"`);
        await queryRunner.query(`CREATE TABLE "temporary_holders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "external_id" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "uuid" varchar NOT NULL, CONSTRAINT "UQ_6e596ebc90e2e21512e60a85e0c" UNIQUE ("external_id"), CONSTRAINT "UQ_fbaffbf87e1efd4879a9b3b5c44" UNIQUE ("uuid"))`);
        await queryRunner.query(`INSERT INTO "temporary_holders"("id", "name", "external_id", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "external_id", "created_at", "updated_at", "deleted_at" FROM "holders"`);
        await queryRunner.query(`DROP TABLE "holders"`);
        await queryRunner.query(`ALTER TABLE "temporary_holders" RENAME TO "holders"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6e596ebc90e2e21512e60a85e0" ON "holders" ("external_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_6e596ebc90e2e21512e60a85e0"`);
        await queryRunner.query(`ALTER TABLE "holders" RENAME TO "temporary_holders"`);
        await queryRunner.query(`CREATE TABLE "holders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "external_id" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, CONSTRAINT "UQ_6e596ebc90e2e21512e60a85e0c" UNIQUE ("external_id"))`);
        await queryRunner.query(`INSERT INTO "holders"("id", "name", "external_id", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "external_id", "created_at", "updated_at", "deleted_at" FROM "temporary_holders"`);
        await queryRunner.query(`DROP TABLE "temporary_holders"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6e596ebc90e2e21512e60a85e0" ON "holders" ("external_id") `);
    }

}
