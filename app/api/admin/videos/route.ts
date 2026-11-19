import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { getApiUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { deleteThumbnailFile, saveThumbnailFile, saveVideoFile } from "@/lib/storage"

function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return m ? m[1] : null
}

/** Upload video baru: file fisik ATAU link YouTube (embed). */
export async function POST(request: Request) {
  const admin = await getApiUser()
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "Body harus multipart/form-data" }, { status: 400 })

  const title = typeof form.get("title") === "string" ? (form.get("title") as string).trim() : ""
  const description =
    typeof form.get("description") === "string" ? (form.get("description") as string).trim() : null
  const sourceType = form.get("sourceType") === "youtube" ? "youtube" : "file"

  if (!title) return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 })

  const id = randomUUID()
  const now = new Date()

  // Simpan thumbnail jika disertakan (gambar kustom atau frame awal video)
  const thumbnailFile = form.get("thumbnail")
  let thumbnailPath: string | null = null
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    try {
      const savedThumb = await saveThumbnailFile(id, thumbnailFile)
      thumbnailPath = savedThumb.filePath
    } catch {
      // Abaikan jika gagal menyimpan thumbnail
    }
  }

  if (sourceType === "youtube") {
    const url = typeof form.get("youtubeUrl") === "string" ? (form.get("youtubeUrl") as string).trim() : ""
    const videoId = parseYouTubeId(url)
    if (!videoId) {
      if (thumbnailPath) await deleteThumbnailFile(thumbnailPath)
      return NextResponse.json({ error: "URL YouTube tidak valid" }, { status: 400 })
    }
    const embed = `https://www.youtube.com/embed/${videoId}`
    await db.insert(video).values({
      id,
      title,
      description,
      filePath: "",
      fileSize: 0,
      mimeType: "video/youtube",
      sourceType: "youtube",
      youtubeUrl: embed,
      thumbnailPath,
      createdBy: admin.id,
      createdAt: now,
      updatedAt: now,
    })
    return NextResponse.json({ id }, { status: 201 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    if (thumbnailPath) await deleteThumbnailFile(thumbnailPath)
    return NextResponse.json({ error: "File video wajib dipilih" }, { status: 400 })
  }

  let saved
  try {
    saved = await saveVideoFile(id, file)
  } catch (err) {
    if (thumbnailPath) await deleteThumbnailFile(thumbnailPath)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload gagal" }, { status: 400 })
  }

  try {
    await db.insert(video).values({
      id,
      title,
      description,
      filePath: saved.filePath,
      fileSize: saved.fileSize,
      mimeType: saved.mimeType,
      sourceType: "file",
      thumbnailPath,
      createdBy: admin.id,
      createdAt: now,
      updatedAt: now,
    })
  } catch (err) {
    const { deleteVideoFile } = await import("@/lib/storage")
    await deleteVideoFile(saved.filePath)
    if (thumbnailPath) await deleteThumbnailFile(thumbnailPath)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal menyimpan" }, { status: 500 })
  }

  return NextResponse.json({ id }, { status: 201 })
}
