import { NextResponse } from "next/server"
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import path from "node:path"
import { Readable } from "node:stream"
import { eq } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth"
import { hasActiveAccess } from "@/lib/access"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"

type Params = { params: Promise<{ id: string }> }

const RANGE_RE = /^bytes=(\d*)-(\d*)$/

/**
 * Streaming video dengan dukungan Range (agar player bisa seek).
 * Cek akses dilakukan SEBELUM byte dikirim: sesi + izin approved yang belum kedaluwarsa.
 * Admin diizinkan preview (memverifikasi upload tanpa harus memberi akses ke diri sendiri).
 */
export async function GET(request: Request, { params }: Params) {
  const session = await getCurrentSession(request.headers).catch(() => null)
  const user = session?.user
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const videos = await db.select().from(video).where(eq(video.id, id)).limit(1)
  const row = videos[0]
  if (!row) return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 })

  if (user.role !== "admin" && !(await hasActiveAccess(user.id, id))) {
    return NextResponse.json({ error: "Akses ditolak atau sudah kedaluwarsa" }, { status: 403 })
  }

  // Video sumber YouTube: redirect ke embed (akses sudah divalidasi di atas).
  if (row.sourceType === "youtube" && row.youtubeUrl) {
    return NextResponse.redirect(row.youtubeUrl)
  }

  const absolutePath = path.join(process.cwd(), row.filePath)
  let size: number
  try {
    size = (await stat(absolutePath)).size
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan di server" }, { status: 404 })
  }

  const baseHeaders: Record<string, string> = {
    "Content-Type": row.mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
  }

  const range = request.headers.get("range")
  if (!range) {
    return new Response(Readable.toWeb(createReadStream(absolutePath)) as ReadableStream, {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(size) },
    })
  }

  const match = RANGE_RE.exec(range.trim())
  if (!match) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } })
  }

  const start = match[1] ? parseInt(match[1], 10) : 0
  let end = match[2] ? parseInt(match[2], 10) : size - 1
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } })
  }
  end = Math.min(end, size - 1)

  const stream = createReadStream(absolutePath, { start, end })
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
    },
  })
}
