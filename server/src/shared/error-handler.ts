import { AppLogger } from "./logger.js";
import { FastifyReply, FastifyRequest } from "./http.types.js";
import { ApiResponse } from "./api-response.js";

const logger = new AppLogger("ErrorHandler");

export async function errorHandler(
  error: any,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  logger.error(error, "Error handled by error handler");

  let status: number = 500;
  let message: string = "Erro interno";

  if (error instanceof ApiResponse) {
    return reply.status(error.status).send(error);
  } else if (error instanceof Error) {
    message = error.message;
  }

  const apiResponse = new ApiResponse(message, null, status);

  return reply.status(apiResponse.status).send(apiResponse);
}
