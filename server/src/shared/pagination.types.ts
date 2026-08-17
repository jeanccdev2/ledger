import z from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type PaginationResponse = {
  totalRows: number;
  totalPages: number;
  page: number;
  limit: number;
};
