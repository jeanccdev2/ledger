import { FastifyReply, FastifyRequest } from "fastify";
import { IHolderService } from "./holder.service.js";
import { ApiResponse } from "../../shared/api-response.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";

export interface IHolderController {
  getFindAll(req: FastifyRequest, res: FastifyReply): Promise<void>;
}

@injectable()
export class HolderController implements IHolderController {
  constructor(
    @inject(TOKENS.Holders.Service)
    readonly holderService: IHolderService,
  ) {}

  async getFindAll(req: FastifyRequest, res: FastifyReply) {
    const data = await this.holderService.findAll();

    const response = ApiResponse.success("List holders successfully", data);

    res.status(response.status).send(response);
  }
}
