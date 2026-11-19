"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, Trash2, UploadCloud, Film, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatBytes, formatDateTime } from "@/lib/format"

export type VideoRow = {
  id: string
  title: string
  description: string | null
  fileSize: number
  sourceType: string
  youtubeUrl: string | null
  thumbnailPath?: string | null
  createdAt: string | Date
}

const ACCEPT_VIDEO = ".mp4,.webm"
const ACCEPT_IMAGE = "image/png,image/jpeg,image/webp"

function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return m ? m[1] : null
}

/** Ambil frame pertama video di browser untuk thumbnail otomatis tanpa butuh ffmpeg server */
function extractFirstFrame(videoFile: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(videoFile)
    video.src = url
    video.muted = true
    video.playsInline = true
    video.preload = "auto"

    let resolved = false
    const cleanup = () => {
      URL.revokeObjectURL(url)
      video.remove()
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        resolve(null)
      }
    }, 8000)

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.1, video.duration > 0 ? video.duration / 2 : 0.1)
    }

    video.onseeked = () => {
      if (resolved) return
      resolved = true
      clearTimeout(timer)
      try {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 360
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          cleanup()
          resolve(null)
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            cleanup()
            resolve(blob)
          },
          "image/jpeg",
          0.85
        )
      } catch {
        cleanup()
        resolve(null)
      }
    }

    video.onerror = () => {
      if (!resolved) {
        resolved = true
        clearTimeout(timer)
        cleanup()
        resolve(null)
      }
    }
  })
}

/** Upload + CRUD video (dipakai halaman /admin/videos). */
export function VideosManager({ videos }: { videos: VideoRow[] }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sourceType, setSourceType] = useState<"file" | "youtube">("file")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  // Thumbnail states
  const [customThumbFile, setCustomThumbFile] = useState<File | null>(null)
  const [customThumbUrl, setCustomThumbUrl] = useState<string | null>(null)
  const [autoThumbBlob, setAutoThumbBlob] = useState<Blob | null>(null)
  const [autoThumbUrl, setAutoThumbUrl] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editThumbFile, setEditThumbFile] = useState<File | null>(null)

  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  // Ketika file video di-select, ekstrak frame awal otomatis
  async function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (autoThumbUrl) URL.revokeObjectURL(autoThumbUrl)
    setAutoThumbBlob(null)
    setAutoThumbUrl(null)

    if (selected) {
      setIsExtracting(true)
      try {
        const blob = await extractFirstFrame(selected)
        if (blob) {
          setAutoThumbBlob(blob)
          setAutoThumbUrl(URL.createObjectURL(blob))
        }
      } finally {
        setIsExtracting(false)
      }
    }
  }

  // Handle upload thumbnail kustom
  function handleCustomThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setCustomThumbFile(selected)
    if (customThumbUrl) URL.revokeObjectURL(customThumbUrl)
    if (selected) {
      setCustomThumbUrl(URL.createObjectURL(selected))
    } else {
      setCustomThumbUrl(null)
    }
  }

  function handleRemoveCustomThumb() {
    setCustomThumbFile(null)
    if (customThumbUrl) URL.revokeObjectURL(customThumbUrl)
    setCustomThumbUrl(null)
    const input = document.getElementById("v-thumb") as HTMLInputElement | null
    if (input) input.value = ""
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (customThumbUrl) URL.revokeObjectURL(customThumbUrl)
      if (autoThumbUrl) URL.revokeObjectURL(autoThumbUrl)
    }
  }, [customThumbUrl, autoThumbUrl])

  async function send(url: string, method: string, form: FormData) {
    setBusy(true)
    setError("")
    try {
      const res = await fetch(url, { method, body: form })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setError(data?.error ?? "Terjadi kesalahan")
        return false
      }
      router.refresh()
      return true
    } catch {
      setError("Gagal menghubungi server")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (sourceType === "file" && !file) {
      setError("Pilih file video (.mp4 / .webm)")
      return
    }
    if (sourceType === "youtube" && !youtubeUrl.trim()) {
      setError("Masukkan URL YouTube")
      return
    }

    const form = new FormData()
    form.set("title", title)
    form.set("description", description)
    form.set("sourceType", sourceType)

    if (sourceType === "file" && file) {
      form.set("file", file)
    } else if (sourceType === "youtube") {
      form.set("youtubeUrl", youtubeUrl.trim())
    }

    // Prioritas thumbnail:
    // 1. Thumbnail kustom jika diunggah admin
    // 2. Jika tidak ada thumbnail kustom & sourceType=file, gunakan frame awal video yang diekstrak otomatis
    if (customThumbFile) {
      form.set("thumbnail", customThumbFile)
    } else if (autoThumbBlob) {
      form.set("thumbnail", autoThumbBlob, "auto-thumbnail.jpg")
    }

    const ok = await send("/api/admin/videos", "POST", form)
    if (ok) {
      setTitle("")
      setDescription("")
      setYoutubeUrl("")
      setFile(null)
      handleRemoveCustomThumb()
      if (autoThumbUrl) URL.revokeObjectURL(autoThumbUrl)
      setAutoThumbBlob(null)
      setAutoThumbUrl(null)

      const input = document.getElementById("v-file") as HTMLInputElement | null
      if (input) input.value = ""
    }
  }

  async function handleSave(id: string) {
    const form = new FormData()
    form.set("title", editTitle)
    form.set("description", editDescription)
    if (editThumbFile) {
      form.set("thumbnail", editThumbFile)
    }
    const ok = await send(`/api/admin/videos/${id}`, "PUT", form)
    if (ok) {
      setEditingId(null)
      setEditThumbFile(null)
    }
  }

  async function handleDelete(video: VideoRow) {
    if (!window.confirm(`Hapus video "${video.title}" beserta file & thumbnail-nya?`)) return
    await send(`/api/admin/videos/${video.id}`, "DELETE", new FormData())
  }

  // Thumbnail preview untuk form upload
  const ytId = sourceType === "youtube" ? parseYouTubeId(youtubeUrl) : null
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form Tambah Video */}
      <form onSubmit={handleUpload} className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
        <h2 className="mb-5 font-bricolage text-xl font-bold tracking-tight text-foreground">
          Tambah Video Baru
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Judul */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="v-title">Judul Video</Label>
            <Input
              id="v-title"
              placeholder="Contoh: Tutorial Arsitektur Sistem Bagian 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Sumber */}
          <div className="flex flex-col gap-1.5">
            <Label>Tipe Sumber</Label>
            <select
              className="h-10 rounded-full border border-border bg-background px-4 text-sm shadow-xs focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as "file" | "youtube")}
            >
              <option value="file">File Fisik (MP4 / WebM, maks 500 MB)</option>
              <option value="youtube">Link Streaming YouTube</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-desc">Deskripsi (Opsional)</Label>
            <Input
              id="v-desc"
              placeholder="Ringkasan isi video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Input Sumber Spesifik */}
          {sourceType === "file" ? (
            <div key="field-file" className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="v-file">File Video (.mp4 atau .webm)</Label>
              <Input
                key="v-file"
                id="v-file"
                type="file"
                accept={ACCEPT_VIDEO}
                onChange={handleVideoFileChange}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Jika admin tidak mengunggah thumbnail kustom, frame awal video akan otomatis diambil sebagai thumbnail.
              </p>
            </div>
          ) : (
            <div key="field-youtube" className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="v-yt">URL Video YouTube</Label>
              <Input
                key="v-yt"
                id="v-yt"
                type="url"
                placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
            </div>
          )}

          {/* Input & Preview Thumbnail */}
          <div className="flex flex-col gap-2 sm:col-span-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="v-thumb" className="font-semibold text-sm">
                  Thumbnail Video (Opsional)
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unggah gambar sampul (.jpg, .png, .webp). Jika dikosongkan, awal video otomatis dijadikan thumbnail.
                </p>
              </div>
              {customThumbFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCustomThumb}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Ganti ke Otomatis
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              {/* File Input Thumbnail Kustom */}
              <div className="flex-1 w-full">
                <Input
                  id="v-thumb"
                  type="file"
                  accept={ACCEPT_IMAGE}
                  onChange={handleCustomThumbChange}
                />
              </div>

              {/* Preview Box */}
              <div className="relative aspect-video w-44 shrink-0 overflow-hidden rounded-xl border border-border bg-neutral-950 flex items-center justify-center text-xs text-muted-foreground">
                {customThumbUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customThumbUrl}
                      alt="Preview Thumbnail Kustom"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs">
                      Kustom
                    </span>
                  </>
                ) : autoThumbUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={autoThumbUrl}
                      alt="Preview Awal Video"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      Awal Video
                    </span>
                  </>
                ) : ytThumb ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ytThumb}
                      alt="Preview YouTube"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs">
                      YouTube
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 p-2 text-center text-[10px] text-muted-foreground">
                    {isExtracting ? (
                      <span className="animate-pulse text-primary font-medium">
                        Mengekstrak frame awal...
                      </span>
                    ) : (
                      <>
                        <ImageIcon className="h-5 w-5 opacity-40" />
                        <span>Sampul otomatis dari awal video</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={busy} className="rounded-full px-8 font-semibold">
            {busy ? "Menyimpan Video..." : "Tambah Video"}
          </Button>
        </div>
      </form>

      {/* Tabel Video */}
      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3.5 w-24">Thumbnail</th>
              <th className="px-4 py-3.5">Judul & Deskripsi</th>
              <th className="px-4 py-3.5">Ukuran</th>
              <th className="px-4 py-3.5">Diunggah</th>
              <th className="px-4 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada video. Silakan upload video pertama di atas.
                </td>
              </tr>
            )}
            {videos.map((video) =>
              editingId === video.id ? (
                <tr key={video.id} className="border-b align-top bg-muted/10">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/videos/${video.id}/thumbnail`}
                      alt={video.title}
                      className="aspect-video w-20 rounded-lg object-cover border border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label="Judul"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <Input
                      aria-label="Deskripsi"
                      className="mt-2"
                      placeholder="Deskripsi"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <div className="mt-2">
                      <Label className="text-[11px] text-muted-foreground">Ganti Thumbnail (opsional)</Label>
                      <Input
                        type="file"
                        accept={ACCEPT_IMAGE}
                        onChange={(e) => setEditThumbFile(e.target.files?.[0] ?? null)}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatBytes(video.fileSize)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(video.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" disabled={busy} onClick={() => handleSave(video.id)}>
                        Simpan
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null)
                          setEditThumbFile(null)
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={video.id} className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3">
                    {/* Thumbnail Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/videos/${video.id}/thumbnail`}
                      alt={video.title}
                      className="aspect-video w-20 rounded-lg object-cover border border-border shadow-xs"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{video.title}</span>
                      {video.sourceType === "youtube" ? (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                          YouTube
                        </span>
                      ) : (
                        <span className="rounded-full bg-primary-background px-2 py-0.5 text-[10px] font-semibold text-primary">
                          MP4 / WebM
                        </span>
                      )}
                    </div>
                    {video.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {video.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {video.sourceType === "youtube" ? "Streaming" : formatBytes(video.fileSize)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateTime(video.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => {
                          setEditingId(video.id)
                          setEditTitle(video.title)
                          setEditDescription(video.description ?? "")
                          setEditThumbFile(null)
                        }}
                      >
                        Ubah
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full text-xs"
                        onClick={() => handleDelete(video)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
