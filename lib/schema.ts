import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"), // "admin" | "customer"
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
})

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
})

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
})

// Domain: video yang diupload admin (file fisik di storage/videos/<id>.<ext>)
export const video = sqliteTable("video", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("filePath").notNull(), // relatif terhadap project root; kosong bila sourceType=youtube
  fileSize: integer("fileSize").notNull(), // byte; 0 bila sourceType=youtube
  mimeType: text("mimeType").notNull(),
  sourceType: text("sourceType").notNull().default("file"), // "file" | "youtube"
  youtubeUrl: text("youtubeUrl"), // URL embed, hanya bila sourceType=youtube
  thumbnailPath: text("thumbnailPath"), // path relatif storage/thumbnails/<id>.<ext>
  createdBy: text("createdBy").references(() => user.id, { onDelete: "set null" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
})

// Satu baris = satu permintaan/keputusan → riwayat akses jelas.
// Akses aktif = baris terakhir berstatus approved dengan expiresAt belum lewat.
export const videoAccess = sqliteTable(
  "video_access",
  {
    id: text("id").primaryKey(),
    videoId: text("videoId")
      .notNull()
      .references(() => video.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "approved", "denied"] })
      .notNull()
      .default("pending"),
    requestedAt: integer("requestedAt", { mode: "timestamp" }).notNull(),
    decidedAt: integer("decidedAt", { mode: "timestamp" }),
    expiresAt: integer("expiresAt", { mode: "timestamp" }),
    decidedBy: text("decidedBy").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [index("video_access_user_video_idx").on(t.userId, t.videoId)]
)
