import z from "zod";
import { paginationQuerySchema } from "../../shared/pagination.types.js";
import {
  amountCentsSchema,
  uuidSchema,
} from "../../shared/shared.validations.js";

export const findAllEntriesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  nsu: z.string().nullable().optional(),
  debitAccountUuid: uuidSchema.nullable().optional(),
  creditAccountUuid: uuidSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  defaultEntryUuid: uuidSchema.nullable().optional(),
  dateFrom: z.coerce.date().nullable().optional(),
  dateTo: z.coerce.date().nullable().optional(),
});

export type FindAllEntriesQuery = z.infer<typeof findAllEntriesQuerySchema>;

export const createEntryBodySchema = z.object({
  nsu: z.string(),
  debitAccountUuid: uuidSchema,
  creditAccountUuid: uuidSchema,
  description: z.string().nullable().optional(),
  defaultEntryUuid: uuidSchema,
  amountCents: amountCentsSchema.nullable().optional(),
});

export type CreateEntryBody = z.infer<typeof createEntryBodySchema>;

export const updateEntryBodySchema = z.object({
  description: z.string().nullable(),
});

export type UpdateEntryBody = z.infer<typeof updateEntryBodySchema>;

export const entryUuidParamSchema = z.object({
  entryUuid: uuidSchema,
});

export type EntryUuidParam = z.infer<typeof entryUuidParamSchema>;
