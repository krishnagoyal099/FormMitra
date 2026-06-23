// src/config/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  // ASI:ONE
  ASI_ONE_API_KEY: z.string().min(20),
  ASI_ONE_BASE_URL: z.string().url().default("https://api.asi1.ai/v1"),
  ASI_ONE_MODEL: z.string().default("asi1"),
  // Storage
  UPLOADTHING_TOKEN: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_BUCKET: z.string().default("documents"),
  // Rate limit
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  // Crypto
  PII_ENCRYPTION_KEY: z.string().min(64),  // 32-byte hex
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  // Email (Gmail via Nodemailer)
  SMTP_USER: z.string().email(),       // e.g. formmitra@gmail.com
  SMTP_PASSWORD: z.string().min(8),    // Google App Password (NOT your real password)
  // Cron security
  CRON_SECRET: z.string().min(16),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration.");
}
export const env = parsed.data;