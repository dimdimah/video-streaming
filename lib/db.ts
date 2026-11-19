import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

// better-sqlite3 berjalan hanya di Node (Server Components / API routes).
// Browser (klien) tidak mengimpor berkas ini; autentikasi klien lewat `authClient`
// (fetch ke /api/auth). Tabel sudah dibuat oleh scripts/setup-db.ts di local.db.
export const sqlite = new Database(process.env.DATABASE_URL ?? "./local.db")
// Wajib ON agar DELETE user/video memicu ON DELETE CASCADE di skema.
sqlite.pragma("foreign_keys = ON")

// drizzle 1.0 rc: config tidak lagi menerima `schema` (tipe = DrizzleConfig);
// tabel diimpor langsung dari lib/schema.ts oleh pemanggil.
export const db = drizzle({
  client: sqlite,
  logger: process.env.NODE_ENV === "development",
})
