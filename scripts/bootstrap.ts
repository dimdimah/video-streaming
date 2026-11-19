import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { randomBytes } from "node:crypto"

async function setupEnv() {
  const envPath = path.join(process.cwd(), ".env")

  if (!existsSync(envPath)) {
    const secret = randomBytes(32).toString("base64url")
    const envContent = [
      `BETTER_AUTH_SECRET=${secret}`,
      `BETTER_AUTH_URL=http://localhost:3000`,
      `DATABASE_URL="./local.db"`,
      "",
    ].join("\n")

    writeFileSync(envPath, envContent, "utf-8")
    console.log("  [+] File .env baru otomatis dibuat (BETTER_AUTH_SECRET tergenerate)")
  }

  // Muat variabel dari .env ke process.env
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, "utf-8")
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIdx = trimmed.indexOf("=")
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

function setupStorage() {
  const videoDir = path.join(process.cwd(), "storage", "videos")
  const thumbDir = path.join(process.cwd(), "storage", "thumbnails")

  mkdirSync(videoDir, { recursive: true })
  mkdirSync(thumbDir, { recursive: true })

  const gitkeepVideo = path.join(videoDir, ".gitkeep")
  const gitkeepThumb = path.join(thumbDir, ".gitkeep")

  if (!existsSync(gitkeepVideo)) writeFileSync(gitkeepVideo, "", "utf-8")
  if (!existsSync(gitkeepThumb)) writeFileSync(gitkeepThumb, "", "utf-8")

  console.log("  [+] Folder storage siap: storage/videos/ & storage/thumbnails/")
}

async function main() {
  console.log("\n========================================================")
  console.log("  ⚡ gatek — Otomatisasi Setup & Inisialisasi Projek")
  console.log("========================================================")

  // 1. Setup .env
  await setupEnv()

  // 2. Setup folder storage
  setupStorage()

  // 3. Setup tabel-tabel SQLite (local.db)
  const { setupDatabase } = await import("./setup-db")
  await setupDatabase()
  console.log("  [+] Database SQLite (local.db) & skema tabel siap")

  // 4. Seed user default jika belum ada
  const { seedDatabase } = await import("./seed")
  await seedDatabase()
  console.log("  [+] Akun pengujian siap (Admin & Customer)")

  console.log("\n--------------------------------------------------------")
  console.log("  ✓ Setup Berhasil! Akun Uji Coba Default:")
  console.log("    • Admin    : admin@test.com / password123")
  console.log("    • Customer : customer@test.com / password123")
  console.log("--------------------------------------------------------\n")
}

main().catch((err) => {
  console.error("✗ Gagal bootstrap:", err)
  process.exit(1)
})
