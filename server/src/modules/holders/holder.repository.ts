import {
  EntityNotFoundError,
  FindOptionsWhere,
  Like,
  Repository,
} from "typeorm";
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
  create(name: string, externalRef: string): Promise<Holder>;
  update(
    holderUuid: string,
    name?: string | undefined,
    externalRef?: string | undefined,
  ): Promise<Holder>;
  delete(holderUuid: string): Promise<Holder>;
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

  async create(name: string, externalRef: string) {
    return this.holderRepo.save({
      name,
      external_id: externalRef,
    });
  }

  async update(
    holderUuid: string,
    name?: string | undefined,
    externalRef?: string | undefined,
  ) {
    const holder = await this.findByUuid(holderUuid);

    if (!holder)
      throw new EntityNotFoundError(Holder, {
        where: {
          uuid: holderUuid,
        },
      });

    if (name) holder.name = name;
    if (externalRef) holder.external_id = externalRef;

    return this.holderRepo.save(holder);
  }

  async delete(holderUuid: string) {
    const holder = await this.findByUuid(holderUuid);

    if (!holder)
      throw new EntityNotFoundError(Holder, {
        where: {
          uuid: holderUuid,
        },
      });

    return this.holderRepo.softRemove(holder);
  }
}
