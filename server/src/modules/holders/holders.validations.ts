import z from "zod";
import { paginationQuerySchema } from "../../shared/pagination.types.js";

export const findAllHoldersQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchName: z.string().nullable().optional(),
});

export type FindAllHoldersQuery = z.infer<typeof findAllHoldersQuerySchema>;
