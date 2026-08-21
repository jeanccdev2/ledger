import z from "zod";
import { paginationQuerySchema } from "../../shared/pagination.types.js";
import { uuidSchema } from "../../shared/shared.validations.js";

export const findAllDefaultEntriesQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  name: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type FindAllDefaultEntriesQuery = z.infer<
  typeof findAllDefaultEntriesQuerySchema
>;

export const defaultEntryUuidParamSchema = z.object({
  defaultEntryUuid: uuidSchema,
});

export type DefaultEntryUuidParam = z.infer<typeof defaultEntryUuidParamSchema>;

const triggerDefaultEntryInputSchema = z.object({
  name: z.string(),
  triggerDefaultEntryUuid: uuidSchema,
  status: z.enum(["active", "inactive"]),
  orderPosition: z.number().int().nonnegative(),
  amountCents: z.number().int().positive().nullable().optional(),
  percentage: z.number().positive().max(100).nullable().optional(),
});

export const createDefaultEntryBodySchema = z.object({
  name: z.string(),
  accountDebitUuid: uuidSchema.nullable().optional(),
  accountCreditUuid: uuidSchema.nullable().optional(),
  status: z.enum(["active", "inactive"]),
  amountCents: z.number().int().positive().nullable().optional(),
  triggerEntries: z.array(triggerDefaultEntryInputSchema).optional(),
});

export type CreateDefaultEntryBody = z.infer<
  typeof createDefaultEntryBodySchema
>;

export const updateDefaultEntryBodySchema = z.object({
  name: z.string().optional(),
  accountDebitUuid: uuidSchema.nullable().optional(),
  accountCreditUuid: uuidSchema.nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  amountCents: z.number().int().positive().nullable().optional(),
  triggerEntries: z.array(triggerDefaultEntryInputSchema).optional(),
});

export type UpdateDefaultEntryBody = z.infer<
  typeof updateDefaultEntryBodySchema
>;
