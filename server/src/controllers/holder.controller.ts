import { FastifyReply, FastifyRequest } from "fastify";
import { HolderService } from "../services/holder.service.js";
import { ApiResponse } from "../utils/api-response.js";

export class HolderController {
  constructor(readonly holderService: HolderService) {}

  async getFindAll(req: FastifyRequest, res: FastifyReply) {
    const data = await this.holderService.findAll();

    const response = ApiResponse.success("List holders successfully", data);

    res.status(response.status).send(response);
  }
}
