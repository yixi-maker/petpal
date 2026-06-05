// Prisma config for PostgreSQL (staging & production)
// Usage: npx prisma migrate deploy --config=prisma.config.postgres.ts
//    or: npx prisma generate --config=prisma.config.postgres.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.postgres.prisma",
  migrations: {
    path: "prisma/migrations-postgres",
  },
  datasource: {
    url: process.env["DATABASE_URL"] as string,
  },
});
