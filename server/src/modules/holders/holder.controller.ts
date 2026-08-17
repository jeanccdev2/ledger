import { IHolderService } from "./holder.service.js";
import { ApiResponse } from "../../shared/api-response.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import {
  CreateHolderBody,
  FindAllHoldersQuery,
  UpdateHolderBody,
} from "./holders.validations.js";
import { FastifyReply, FastifyRequest } from "../../shared/http.types.js";
import { Uuid } from "../../shared/shared.validations.js";

export interface IHolderController {
  getFindAll(
    req: FastifyRequest<{ query: FindAllHoldersQuery }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  getByUuid(
    req: FastifyRequest<{ params: { holderUuid: Uuid } }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  postCreateHolder(
    req: FastifyRequest<{ body: CreateHolderBody }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  patchUpdateHolder(
    req: FastifyRequest<{
      params: { holderUuid: Uuid };
      body: UpdateHolderBody;
    }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  deleteHolder(
    req: FastifyRequest<{ params: { holderUuid: Uuid } }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
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

    return response;
  };

  getByUuid = async (
    req: FastifyRequest<{ params: { holderUuid: Uuid } }>,
    res: FastifyReply,
  ) => {
    const { holderUuid } = req.params;
    const data = await this.holderService.findByUuid(holderUuid);
    const response = ApiResponse.ok("Get holder by uuid successfully", data);

    return response;
  };

  postCreateHolder = async (
    req: FastifyRequest<{ body: CreateHolderBody }>,
    res: FastifyReply,
  ) => {
    const { body } = req;
    const data = await this.holderService.createHolder(body);
    const response = ApiResponse.ok("Create holder successfully", data);
    return response;
  };

  patchUpdateHolder = async (
    req: FastifyRequest<{
      params: { holderUuid: Uuid };
      body: UpdateHolderBody;
    }>,
    res: FastifyReply,
  ) => {
    const { holderUuid } = req.params;
    const { body } = req;
    const data = await this.holderService.updateHolder(holderUuid, body);
    const response = ApiResponse.ok("Update holder successfully", data);
    return response;
  };

  deleteHolder = async (
    req: FastifyRequest<{ params: { holderUuid: Uuid } }>,
    res: FastifyReply,
  ) => {
    const { holderUuid } = req.params;
    const data = await this.holderService.deleteHolder(holderUuid);
    const response = ApiResponse.ok("Delete holder successfully", data);
    return response;
  };
}
