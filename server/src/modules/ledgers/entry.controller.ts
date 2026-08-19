import { IEntryService } from "./entry.service.js";
import { ApiResponse } from "../../shared/api-response.js";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../container/tokens.js";
import {
  CreateEntryBody,
  FindAllEntriesQuery,
  EntryUuidParam,
  UpdateEntryBody,
} from "./entry.validations.js";
import { FastifyReply, FastifyRequest } from "../../shared/http.types.js";
import { Uuid } from "../../shared/shared.validations.js";

export interface IEntryController {
  getFindAll(
    req: FastifyRequest<{ query: FindAllEntriesQuery }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  getByUuid(
    req: FastifyRequest<{ params: EntryUuidParam }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  postCreateEntry(
    req: FastifyRequest<{ body: CreateEntryBody }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
  patchUpdateEntry(
    req: FastifyRequest<{
      params: EntryUuidParam;
      body: UpdateEntryBody;
    }>,
    res: FastifyReply,
  ): Promise<ApiResponse>;
}

@injectable()
export class EntryController implements IEntryController {
  constructor(
    @inject(TOKENS.Entries.Service)
    readonly entryService: IEntryService,
  ) {}

  getFindAll = async (
    req: FastifyRequest<{ query: FindAllEntriesQuery }>,
    res: FastifyReply,
  ) => {
    const data = await this.entryService.findAll(req.query);

    const response = ApiResponse.ok("List entries successfully", data);

    return response;
  };

  getByUuid = async (
    req: FastifyRequest<{ params: EntryUuidParam }>,
    res: FastifyReply,
  ) => {
    const { entryUuid } = req.params;
    const data = await this.entryService.findByUuid(entryUuid);
    const response = ApiResponse.ok("Get entry by uuid successfully", data);

    return response;
  };

  postCreateEntry = async (
    req: FastifyRequest<{ body: CreateEntryBody }>,
    res: FastifyReply,
  ) => {
    const { body } = req;
    const data = await this.entryService.createEntry(body);
    const response = ApiResponse.ok("Create entry successfully", data);
    return response;
  };

  patchUpdateEntry = async (
    req: FastifyRequest<{
      params: EntryUuidParam;
      body: UpdateEntryBody;
    }>,
    res: FastifyReply,
  ) => {
    const { entryUuid } = req.params;
    const { body } = req;
    const data = await this.entryService.updateEntry(entryUuid, body);
    const response = ApiResponse.ok("Update entry successfully", data);
    return response;
  };
}
