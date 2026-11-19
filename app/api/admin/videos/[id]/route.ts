import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { getApiUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { deleteVideoFile, saveVideoFile } from "@/lib/storage"

function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return m ? m[1] : null
}

type Params = { params: Promise<{ id: string }> }

async function findVideo(id: string) {
  const rows = await db.select().from(video).where(eq(video.id, id)).limit(1)
  return rows[0] ?? null
}

/** Update judul/deskripsi; ganti file bila upload baru disertakan. */
export async function PUT(request: Request, { params }: Params) {
  const admin = await getApiUser()
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const existing = await findVideo(id)
  if (!existing) return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 })

  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "Body harus multipart/form-data" }, { status: 400 })

  const title = typeof form.get("title") === "string" ? (form.get("title") as string).trim() : ""
  const description =
    typeof form.get("description") === "string" ? (form.get("description") as string).trim() : null
  if (!title) return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 })

  const sourceType = form.get("sourceType") === "youtube" ? "youtube" : "file"

  if (sourceType === "youtube") {
    const url = typeof form.get("youtubeUrl") === "string" ? (form.get("youtubeUrl") as string).trim() : ""
    const videoId = parseYouTubeId(url)
    if (!videoId) return NextResponse.json({ error: "URL YouTube tidak valid" }, { status: 400 })
    const embed = `https://www.youtube.com/embed/${videoId}`
    await db
      .update(video)
      .set({
        title,
        description,
        sourceType: "youtube",
        youtubeUrl: embed,
        filePath: "",
        fileSize: 0,
        mimeType: "video/youtube",
        updatedAt: new Date(),
      })
      .where(eq(video.id, id))
    if (existing.sourceType === "file") await deleteVideoFile(existing.filePath)
    return NextResponse.json({ ok: true })
  }

  const file = form.get("file")
  if (file instanceof File && file.size > 0) {
    let saved
    try {
      saved = await saveVideoFile(id, file)
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Upload gagal" }, { status: 400 })
    }
    await db
      .update(video)
      .set({
        title,
        description,
        sourceType: "file",
        youtubeUrl: null,
        filePath: saved.filePath,
        fileSize: saved.fileSize,
        mimeType: saved.mimeType,
        updatedAt: new Date(),
      })
      .where(eq(video.id, id))
    if (existing.sourceType === "file") await deleteVideoFile(existing.filePath)
  } else {
    await db.update(video).set({ title, description, updatedAt: new Date() }).where(eq(video.id, id))
  }

  return NextResponse.json({ ok: true })
}

/** Hapus video + file fisik; baris video_access ikut hilang (FK cascade ON). */
export async function DELETE(_request: Request, { params }: Params) {
  const admin = await getApiUser()
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const existing = await findVideo(id)
  if (!existing) return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 })

  await db.delete(video).where(eq(video.id, id))
  await deleteVideoFile(existing.filePath)
  return NextResponse.json({ ok: true })
}
