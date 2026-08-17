import { IHolderService } from "./holder.service.js";
import { ApiResponse } from "../../shared/api-response.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { FindAllHoldersQuery } from "./holders.validations.js";
import { FastifyReply, FastifyRequest } from "../../shared/http.types.js";

export interface IHolderController {
  getFindAll(
    req: FastifyRequest<{ query: FindAllHoldersQuery }>,
    res: FastifyReply,
  ): Promise<void>;
}

@injectable()
export class HolderController implements IHolderController {
  constructor(
    @inject(TOKENS.Holders.Service)
    readonly holderService: IHolderService,
  ) {}

  getFindAll = async (
    req: FastifyRequest<{ query: FindAllHoldersQuery }>,
    res: FastifyReply,
  ) => {
    const data = await this.holderService.findAll(req.query);

    const response = ApiResponse.ok("List holders successfully", data);

    res.status(response.status).send(response);
  };
}
