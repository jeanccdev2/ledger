import { EntityNotFoundError } from "typeorm";
import { Holder } from "../../database/entities/holder.entity.js";
import { IHolderRepository } from "./holder.repository.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { PaginationResponse } from "../../shared/pagination.types.js";
import { FindAllHoldersQuery } from "./holders.validations.js";

type SerializedHolder = {
  id: number;
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
  findOne(holderId: number): Promise<unknown>;
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
      id: holder.id,
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

  async findOne(holderId: number) {
    const holder = await this.holderRepository.findById(holderId);

    return this.serializeHolder(holder);
  }
}
