import type {
  FastifyRequest as BaseFastifyRequest,
  FastifyReply as BaseFastifyReply,
} from "fastify";

export interface RouteGeneric {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  headers?: unknown;
}

export type FastifyRequest<TSchema extends RouteGeneric = RouteGeneric> =
  BaseFastifyRequest<{
    Body: TSchema extends { body: infer B } ? B : unknown;
    Params: TSchema extends { params: infer P } ? P : unknown;
    Querystring: TSchema extends { query: infer Q } ? Q : unknown;
    Headers: TSchema extends { headers: infer H } ? H : unknown;
  }>;

export type FastifyReply = BaseFastifyReply;
export type HttpRequest<TSchema extends RouteGeneric = RouteGeneric> =
  FastifyRequest<TSchema>;
export type HttpReply = FastifyReply;
