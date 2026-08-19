import { EntityNotFoundError } from "typeorm";
import { Holder } from "../../database/entities/holder.entity.js";
import { IHolderRepository } from "./holder.repository.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { PaginationResponse } from "../../shared/pagination.types.js";
import {
  CreateHolderBody,
  FindAllHoldersQuery,
  UpdateHolderBody,
} from "./holders.validations.js";
import { Uuid } from "../../shared/shared.validations.js";

type SerializedHolder = {
  id: Uuid;
  name: string;
  external_id: string;
  created_at: Date;
  updated_at: Date;
};

export interface IHolderService {
  findAll(query: FindAllHoldersQuery): Promise<{
    data: SerializedHolder[];
    pagination: PaginationResponse;
  }>;
  findByUuid(holderUuid: string): Promise<SerializedHolder | null>;
  createHolder(holder: CreateHolderBody): Promise<SerializedHolder>;
  updateHolder(
    holderUuid: Uuid,
    holder: UpdateHolderBody,
  ): Promise<SerializedHolder>;
  deleteHolder(holderUuid: string): Promise<SerializedHolder>;
}

@injectable()
export class HolderService implements IHolderService {
  constructor(
    @inject(TOKENS.Holders.Repository)
    private readonly holderRepository: IHolderRepository,
  ) {}

  private serializeHolder(holder: Holder | null): SerializedHolder {
    if (!holder) throw new EntityNotFoundError(Holder, "");

    return {
      id: holder.uuid,
      name: holder.name,
      external_id: holder.external_id,
      created_at: holder.created_at,
      updated_at: holder.updated_at,
    };
  }

  async findAll(query: FindAllHoldersQuery) {
    const limit = query.limit;
    const page = query.page;
    const searchName = query.searchName;

    const [holders, total] = await this.holderRepository.findAll(
      limit,
      page,
      searchName,
    );

    const serializedHolders = holders.map(this.serializeHolder);
    const totalRows = total;
    const totalPages = Math.ceil(totalRows / limit);

    const paginationResponse: PaginationResponse = {
      totalRows,
      totalPages,
      page,
      limit,
    };

    return {
      data: serializedHolders,
      pagination: paginationResponse,
    };
  }

  async findByUuid(holderUuid: string) {
    const holder = await this.holderRepository.findByUuid(holderUuid);

    if (!holder) return null;

    return this.serializeHolder(holder);
  }

  async createHolder(holder: CreateHolderBody) {
    const newHolder = await this.holderRepository.create(
      holder.name,
      holder.external_id,
    );

    return this.serializeHolder(newHolder);
  }

  async updateHolder(holderUuid: Uuid, holder: UpdateHolderBody) {
    const existsHolder = await this.findByUuid(holderUuid);

    if (!existsHolder)
      throw new EntityNotFoundError(Holder, "Holder não encontrado");

    const updatedHolder = await this.holderRepository.update(
      holderUuid,
      holder.name,
      holder.external_id,
    );

    return this.serializeHolder(updatedHolder);
  }

  async deleteHolder(holderUuid: string) {
    const existsHolder = await this.findByUuid(holderUuid);

    if (!existsHolder)
      throw new EntityNotFoundError(Holder, "Holder não encontrado");

    const deletedHolder = await this.holderRepository.delete(holderUuid);

    return this.serializeHolder(deletedHolder);
  }
}
