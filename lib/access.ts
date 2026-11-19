import { and, desc, eq } from "drizzle-orm"
import { db } from "./db"
import { videoAccess } from "./schema"

export type AccessStatus = "none" | "pending" | "active" | "expired" | "denied"

export type AccessState = {
  status: AccessStatus
  expiresAt: Date | null
}

/**
 * Status akses customer terhadap satu video.
 * Akses aktif = ada baris approved yang expiresAt-nya belum lewat;
 * selain itu status ditentukan oleh keputusan terbaru.
 */
export async function getVideoAccess(userId: string, videoId: string): Promise<AccessState> {
  const rows = await db
    .select()
    .from(videoAccess)
    .where(and(eq(videoAccess.userId, userId), eq(videoAccess.videoId, videoId)))
    .orderBy(desc(videoAccess.requestedAt))

  if (rows.length === 0) return { status: "none", expiresAt: null }

  const now = new Date()
  const active = rows.find((r) => r.status === "approved" && r.expiresAt && r.expiresAt > now)
  if (active) return { status: "active", expiresAt: active.expiresAt }

  const latest = rows[0]
  if (latest.status === "pending") return { status: "pending", expiresAt: null }
  if (latest.status === "denied") return { status: "denied", expiresAt: null }
  return { status: "expired", expiresAt: latest.expiresAt }
}

/** Boolean cepat untuk guard streaming. */
export async function hasActiveAccess(userId: string, videoId: string): Promise<boolean> {
  const state = await getVideoAccess(userId, videoId)
  return state.status === "active"
}
