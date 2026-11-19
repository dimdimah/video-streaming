import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { getApiUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { videoAccess } from "@/lib/schema"

type Params = { params: Promise<{ id: string }> }

const MAX_DURATION_HOURS = 720 // 30 hari

/**
 * Admin memutuskan permintaan akses.
 * action: "approve" (butuh `hours` → expiresAt = sekarang + hours) | "deny"
 */
export async function PATCH(request: Request, { params }: Params) {
  const admin = await getApiUser()
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = (await request.json().catch(() => null)) as {
    action?: "approve" | "deny"
    hours?: number
  } | null

  const rows = await db.select().from(videoAccess).where(eq(videoAccess.id, id)).limit(1)
  const row = rows[0]
  if (!row) return NextResponse.json({ error: "Permintaan tidak ditemukan" }, { status: 404 })
  if (row.status !== "pending") {
    return NextResponse.json({ error: "Permintaan sudah pernah diputuskan" }, { status: 409 })
  }

  if (body?.action === "deny") {
    await db
      .update(videoAccess)
      .set({ status: "denied", decidedAt: new Date(), decidedBy: admin.id })
      .where(eq(videoAccess.id, id))
    return NextResponse.json({ ok: true, status: "denied" })
  }

  if (body?.action === "approve") {
    const hours = Number(body.hours)
    if (!Number.isFinite(hours) || hours < 1 || hours > MAX_DURATION_HOURS) {
      return NextResponse.json(
        { error: `Durasi harus 1–${MAX_DURATION_HOURS} jam` },
        { status: 400 }
      )
    }
    const now = new Date()
    const expiresAt = new Date(now.getTime() + hours * 3600 * 1000)
    await db
      .update(videoAccess)
      .set({
        status: "approved",
        decidedAt: now,
        decidedBy: admin.id,
        expiresAt,
      })
      .where(eq(videoAccess.id, id))
    return NextResponse.json({ ok: true, status: "approved", expiresAt })
  }

  return NextResponse.json({ error: "action harus approve atau deny" }, { status: 400 })
}
