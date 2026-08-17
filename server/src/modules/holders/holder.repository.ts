import { Repository } from "typeorm";
import { Holder } from "../../database/entities/holder.entity.js";
import { injectable } from "tsyringe";
import { dataSource } from "../../database/datasource.js";

export interface IHolderRepository {
  findAll(): Promise<[Holder[], number]>;
  findById(holderId: number): Promise<Holder | null>;
}

@injectable()
export class HolderRepository implements IHolderRepository {
  private holderRepo: Repository<Holder>;

  constructor() {
    this.holderRepo = dataSource.getRepository(Holder);
  }

  async findAll() {
    return this.holderRepo.findAndCount();
  }

  async findById(holderId: number) {
    return this.holderRepo.findOneBy({
      id: holderId,
    });
  }
}
