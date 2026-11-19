import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { hashPassword } from "better-auth/crypto"
import { db } from "../lib/db"
import { account, user } from "../lib/schema"

/**
 * Seeder 1 admin + 1 customer untuk testing.
 * Idempotent: akun yang sudah ada akan dilewati. Jalankan: `npx tsx scripts/seed.ts`
 */
const SEED = [
  { name: "Admin Test", email: "admin@test.com", password: "password123", role: "admin" },
  { name: "Customer Test", email: "customer@test.com", password: "password123", role: "customer" },
] as const

export async function seedDatabase() {
  for (const s of SEED) {
    const existing = await db.select().from(user).where(eq(user.email, s.email)).limit(1)
    if (existing[0]) {
      continue
    }

    const id = randomUUID()
    const now = new Date()
    await db.insert(user).values({
      id,
      name: s.name,
      email: s.email,
      emailVerified: true, // nonaktifkan alur verifikasi email untuk test
      role: s.role,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(account).values({
      id: randomUUID(),
      accountId: id, // provider credential: accountId = userId
      providerId: "credential",
      userId: id,
      password: await hashPassword(s.password),
      createdAt: now,
      updatedAt: now,
    })
  }
}

const isMain = process.argv[1]?.includes("seed")
if (isMain) {
  seedDatabase()
    .then(() => {
      console.log("✓ Seed selesai")
      process.exit(0)
    })
    .catch((err) => {
      console.error("✗ Seed gagal:", err)
      process.exit(1)
    })
}
