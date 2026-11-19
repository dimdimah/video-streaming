import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { getApiUser } from "@/lib/auth"
import { getVideoAccess } from "@/lib/access"
import { db } from "@/lib/db"
import { video, videoAccess } from "@/lib/schema"

/** Customer meminta akses menonton satu video. */
export async function POST(request: Request) {
  const user = await getApiUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "customer") {
    return NextResponse.json({ error: "Hanya customer yang boleh meminta akses" }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as { videoId?: string } | null
  const videoId = body?.videoId
  if (!videoId) return NextResponse.json({ error: "videoId wajib diisi" }, { status: 400 })

  const videos = await db.select().from(video).where(eq(video.id, videoId)).limit(1)
  if (!videos[0]) return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 })

  const access = await getVideoAccess(user.id, videoId)
  if (access.status === "active") {
    return NextResponse.json({ error: "Anda sudah punya akses aktif" }, { status: 409 })
  }
  if (access.status === "pending") {
    return NextResponse.json({ error: "Permintaan masih menunggu persetujuan admin" }, { status: 409 })
  }

  await db.insert(videoAccess).values({
    id: randomUUID(),
    videoId,
    userId: user.id,
    status: "pending",
    requestedAt: new Date(),
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
