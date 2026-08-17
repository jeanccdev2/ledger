import { FindOptionsWhere, Like, Repository } from "typeorm";
import { Holder } from "../../database/entities/holder.entity.js";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";

export interface IHolderRepository {
  findAll(
    limit: number,
    page: number,
    searchName?: string | null,
  ): Promise<[Holder[], number]>;
  findByUuid(holderUuid: string): Promise<Holder | null>;
}

@injectable()
export class HolderRepository implements IHolderRepository {
  private holderRepo: Repository<Holder>;

  constructor() {
    this.holderRepo = dataSource.getRepository(Holder);
  }

  async findAll(limit: number, offset: number, searchName?: string | null) {
    const filters: FindOptionsWhere<Holder> = {};

    if (searchName) filters.name = Like(`%${searchName}%`);

    return this.holderRepo.findAndCount({
      take: limit,
      skip: offset,
      where: filters,
    });
  }

  async findByUuid(holderUuid: string) {
    return this.holderRepo.findOneBy({
      uuid: holderUuid,
    });
  }
}
