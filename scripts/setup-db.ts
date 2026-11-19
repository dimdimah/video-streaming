import { createClient } from "@libsql/client"

/** Skrip untuk memastikan tabel ada di SQLite lokal (local.db). Idempotent. */
export async function setupDatabase() {
  const raw = process.env.DATABASE_URL ?? "./local.db"
  const url = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `file:${raw}`
  const libsql = createClient({ url })

  async function exec(sql: string) {
    try {
      await libsql.execute(sql)
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? String(e)
      if (!/duplicate|already exists/i.test(msg)) throw e
    }
  }

  await exec(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" INTEGER NOT NULL DEFAULT 0,
      "image" TEXT,
      "role" TEXT NOT NULL DEFAULT 'customer',
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL
    )
  `)
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user"("email")`)
  await exec(`ALTER TABLE "user" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'customer'`)
  await exec(`UPDATE "user" SET "role" = 'customer' WHERE "role" = 'user'`)

  await exec(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expiresAt" INTEGER NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    )
  `)
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "session_token_unique" ON "session"("token")`)
  await exec(`CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId")`)

  await exec(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" INTEGER,
      "refreshTokenExpiresAt" INTEGER,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    )
  `)
  await exec(`CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId")`)

  await exec(`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" INTEGER NOT NULL,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL
    )
  `)
  await exec(`CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier")`)

  await exec(`
    CREATE TABLE IF NOT EXISTS "video" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "filePath" TEXT NOT NULL DEFAULT '',
      "fileSize" INTEGER NOT NULL DEFAULT 0,
      "mimeType" TEXT NOT NULL DEFAULT 'video/mp4',
      "sourceType" TEXT NOT NULL DEFAULT 'file',
      "youtubeUrl" TEXT,
      "thumbnailPath" TEXT,
      "createdBy" TEXT,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL,
      FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL
    )
  `)
  await exec(`ALTER TABLE "video" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'file'`)
  await exec(`ALTER TABLE "video" ADD COLUMN "youtubeUrl" TEXT`)
  await exec(`ALTER TABLE "video" ADD COLUMN "thumbnailPath" TEXT`)

  await exec(`
    CREATE TABLE IF NOT EXISTS "video_access" (
      "id" TEXT PRIMARY KEY,
      "videoId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "requestedAt" INTEGER NOT NULL,
      "decidedAt" INTEGER,
      "expiresAt" INTEGER,
      "decidedBy" TEXT,
      FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE CASCADE,
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
      FOREIGN KEY ("decidedBy") REFERENCES "user"("id") ON DELETE SET NULL
    )
  `)
  await exec(`CREATE INDEX IF NOT EXISTS "video_access_user_video_idx" ON "video_access"("userId", "videoId")`)

  await libsql.close()
}

const isMain = process.argv[1]?.includes("setup-db")
if (isMain) {
  setupDatabase().catch((err) => {
    console.error("✗ Gagal memastikan tabel:", err)
    process.exit(1)
  })
}
