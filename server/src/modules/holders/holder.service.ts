import { EntityNotFoundError } from "typeorm";
import { Holder } from "../../database/entities/holder.entity.js";
import { HolderRepository } from "./holder.repository.js";

export class HolderService {
  constructor(readonly holderRepository: HolderRepository) {}

  private serializeHolder(holder: Holder | null) {
    if (!holder) throw new EntityNotFoundError(Holder, "");

    return {
      id: holder.id,
      name: holder.name,
      external_id: holder.external_id,
      created_at: holder.created_at,
      updated_at: holder.updated_at,
      deleted_at: holder.deleted_at,
      holderAccounts: holder.holderAccounts,
    };
  }

  async findAll() {
    const [holders, total] = await this.holderRepository.findAll();

    const serializedHolders = holders.map(this.serializeHolder);

    return {
      data: serializedHolders,
      pagination: {
        totalRows: total,
      },
    };
  }

  async findOne(holderId: number) {
    const holder = await this.holderRepository.findById(holderId);

    return this.serializeHolder(holder);
  }
}
