import z from "zod";
import "dotenv/config";

const databaseSchema = z.object({
  DB_TYPE: z.enum(["postgres"]).default("postgres"),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
});

const appSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("127.0.0.1"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.coerce.number().default(3600),
});

const envSchema = z.object({
  ...databaseSchema.shape,
  ...appSchema.shape,
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
