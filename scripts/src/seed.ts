import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import crypto from "crypto";

const JWT_SECRET = process.env["SESSION_SECRET"] || "arn-infra-secret-key";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + JWT_SECRET).digest("hex");
}

async function seed() {
  const existing = await db.select().from(usersTable);
  if (existing.length > 0) {
    console.log("Users already exist, skipping seed");
    return;
  }

  await db.insert(usersTable).values([
    {
      name: "Admin",
      email: "admin@arninfra.com",
      password: hashPassword("admin123"),
      role: "admin",
    },
    {
      name: "Operator",
      email: "operator@arninfra.com",
      password: hashPassword("operator123"),
      role: "operator",
    },
  ]);

  console.log("Seed complete: created admin and operator users");
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
