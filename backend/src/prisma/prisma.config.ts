import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient()

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
