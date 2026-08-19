import z from "zod";

export const uuidSchema = z.uuidv4();
export type Uuid = z.infer<typeof uuidSchema>;

export const emailSchema = z.email();
export type Email = z.infer<typeof emailSchema>;

export const passwordSchema = z.string().min(8);
export type Password = z.infer<typeof passwordSchema>;

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export type IsoDate = z.infer<typeof isoDateSchema>;

export const isoDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
export type IsoDateTime = z.infer<typeof isoDateTimeSchema>;

export const amountCentsSchema = z.number().int().positive();
export type AmountCents = z.infer<typeof amountCentsSchema>;
