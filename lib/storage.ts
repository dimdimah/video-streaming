import { createWriteStream } from "node:fs"
import { mkdir, stat, unlink } from "node:fs/promises"
import path from "node:path"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"

/** File video disimpan lokal (di luar public/ agar tidak bisa diakses langsung tanpa cek akses). */
export const VIDEO_DIR = path.join(process.cwd(), "storage", "videos")
export const THUMBNAIL_DIR = path.join(process.cwd(), "storage", "thumbnails")

// shortcut: hanya ekstensi ini yang diterima, tanpa cek codec dalam-file —
// upgrade ke ffprobe bila perlu menolak file yang ekstensinya diganti paksa.
export const ALLOWED_EXTENSIONS = [".mp4", ".webm"] as const
export const ALLOWED_THUMBNAIL_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024 // 500 MB
export const MAX_THUMBNAIL_BYTES = 10 * 1024 * 1024 // 10 MB

export type SavedVideo = {
  filePath: string // relatif terhadap project root, disimpan di DB
  absolutePath: string
  mimeType: string
  fileSize: number
}

export function extensionOf(filename: string): string {
  return path.extname(filename).toLowerCase()
}

/** Simpan file upload ke storage/videos/<id><ext>. Lempar Error bila tipe/ukuran tidak valid. */
export async function saveVideoFile(id: string, file: File): Promise<SavedVideo> {
  const ext = extensionOf(file.name)
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    throw new Error(`Format tidak didukung. Gunakan ${ALLOWED_EXTENSIONS.join(" atau ")}`)
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Ukuran file melebihi 500 MB")
  }
  await mkdir(VIDEO_DIR, { recursive: true })
  const filePath = path.join("storage", "videos", `${id}${ext}`)
  const absolutePath = path.join(process.cwd(), filePath)
  await pipeline(Readable.fromWeb(file.stream() as import("node:stream/web").ReadableStream), createWriteStream(absolutePath))
  return {
    filePath,
    absolutePath,
    mimeType: ext === ".webm" ? "video/webm" : "video/mp4",
    fileSize: file.size,
  }
}

/** Hapus file video; diamkan bila sudah tidak ada. */
export async function deleteVideoFile(filePath: string): Promise<void> {
  try {
    await unlink(path.join(process.cwd(), filePath))
  } catch {
    // ENOENT: file sudah hilang, tidak masalah
  }
}

export async function fileSizeOf(filePath: string): Promise<number> {
  const s = await stat(path.join(process.cwd(), filePath))
  return s.size
}

/** Simpan thumbnail (kustom dari user atau hasil capture frame awal video). */
export async function saveThumbnailFile(
  id: string,
  file: File | Blob
): Promise<{ filePath: string; absolutePath: string }> {
  let ext = ".jpg"
  if ("name" in file && typeof file.name === "string") {
    const e = extensionOf(file.name)
    if (ALLOWED_THUMBNAIL_EXTENSIONS.includes(e as (typeof ALLOWED_THUMBNAIL_EXTENSIONS)[number])) {
      ext = e
    }
  } else if ("type" in file && typeof file.type === "string") {
    if (file.type === "image/png") ext = ".png"
    else if (file.type === "image/webp") ext = ".webp"
    else ext = ".jpg"
  }

  await mkdir(THUMBNAIL_DIR, { recursive: true })
  const filePath = path.join("storage", "thumbnails", `${id}${ext}`)
  const absolutePath = path.join(process.cwd(), filePath)
  await pipeline(
    Readable.fromWeb(file.stream() as import("node:stream/web").ReadableStream),
    createWriteStream(absolutePath)
  )
  return { filePath, absolutePath }
}

/** Hapus file thumbnail jika ada. */
export async function deleteThumbnailFile(filePath: string | null | undefined): Promise<void> {
  if (!filePath) return
  try {
    await unlink(path.join(process.cwd(), filePath))
  } catch {
    // ENOENT: file tidak ditemukan, abaikan
  }
}
