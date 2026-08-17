import z from "zod";
import { paginationQuerySchema } from "../../shared/pagination.types.js";

export const findAllHoldersQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchName: z.string().nullable().optional(),
});

export type FindAllHoldersQuery = z.infer<typeof findAllHoldersQuerySchema>;

export const createHolderBodySchema = z.object({
  name: z.string(),
  external_id: z.string(),
});

export type CreateHolderBody = z.infer<typeof createHolderBodySchema>;

export const updateHolderBodySchema = createHolderBodySchema.partial();

export type UpdateHolderBody = z.infer<typeof updateHolderBodySchema>;
