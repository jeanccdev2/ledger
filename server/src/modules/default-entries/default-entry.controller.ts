import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import { IDefaultEntryService } from "./default-entry.service.js";
import { ApiResponse } from "../../shared/api-response.js";
import { FastifyReply, FastifyRequest } from "../../shared/http.types.js";
import {
  CreateDefaultEntryBody,
  DefaultEntryUuidParam,
  FindAllDefaultEntriesQuery,
  UpdateDefaultEntryBody,
} from "./default-entries.validations.js";

export interface IDefaultEntryController {
  getFindAll(
    req: FastifyRequest<{ query: FindAllDefaultEntriesQuery }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  getByUuid(
    req: FastifyRequest<{ params: DefaultEntryUuidParam }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  postCreateDefaultEntry(
    req: FastifyRequest<{ body: CreateDefaultEntryBody }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  patchUpdateDefaultEntry(
    req: FastifyRequest<{
      params: DefaultEntryUuidParam;
      body: UpdateDefaultEntryBody;
    }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  deleteDefaultEntry(
    req: FastifyRequest<{ params: DefaultEntryUuidParam }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
}

@injectable()
export class DefaultEntryController implements IDefaultEntryController {
  constructor(
    @inject(TOKENS.DefaultEntries.Service)
    readonly defaultEntryService: IDefaultEntryService,
  ) {}

  getFindAll = async (
    req: FastifyRequest<{ query: FindAllDefaultEntriesQuery }>,
    res: FastifyReply,
  ) => {
    const data = await this.defaultEntryService.findAll(req.query);
    return ApiResponse.ok("List default entries successfully", data);
  };

  getByUuid = async (
    req: FastifyRequest<{ params: DefaultEntryUuidParam }>,
    res: FastifyReply,
  ) => {
    const { defaultEntryUuid } = req.params;
    const data = await this.defaultEntryService.findByUuid(defaultEntryUuid);
    if (!data) {
      throw ApiResponse.notFound("Default entry não encontrado");
    }
    return ApiResponse.ok("Get default entry by uuid successfully", data);
  };

  postCreateDefaultEntry = async (
    req: FastifyRequest<{ body: CreateDefaultEntryBody }>,
    res: FastifyReply,
  ) => {
    const data = await this.defaultEntryService.createDefaultEntry(req.body);
    return ApiResponse.ok("Create default entry successfully", data);
  };

  patchUpdateDefaultEntry = async (
    req: FastifyRequest<{
      params: DefaultEntryUuidParam;
      body: UpdateDefaultEntryBody;
    }>,
    res: FastifyReply,
  ) => {
    const { defaultEntryUuid } = req.params;
    const data = await this.defaultEntryService.updateDefaultEntry(
      defaultEntryUuid,
      req.body,
    );
    return ApiResponse.ok("Update default entry successfully", data);
  };

  deleteDefaultEntry = async (
    req: FastifyRequest<{ params: DefaultEntryUuidParam }>,
    res: FastifyReply,
  ) => {
    const { defaultEntryUuid } = req.params;
    const data = await this.defaultEntryService.deleteDefaultEntry(defaultEntryUuid);
    return ApiResponse.ok("Delete default entry successfully", data);
  };
}
