"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  createdAt: string | Date
}

const ACCEPT = ".mp4,.webm"

/** Upload + CRUD video (dipakai halaman /admin/videos). */
export function VideosManager({ videos }: { videos: VideoRow[] }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sourceType, setSourceType] = useState<"file" | "youtube">("file")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

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
    const ok = await send("/api/admin/videos", "POST", form)
    if (ok) {
      setTitle("")
      setDescription("")
      setYoutubeUrl("")
      setFile(null)
      const input = document.getElementById("v-file") as HTMLInputElement | null
      if (input) input.value = ""
    }
  }

  async function handleSave(id: string) {
    const form = new FormData()
    form.set("title", editTitle)
    form.set("description", editDescription)
    const ok = await send(`/api/admin/videos/${id}`, "PUT", form)
    if (ok) setEditingId(null)
  }

  async function handleDelete(video: VideoRow) {
    // shortcut: konfirmasi dialog bawaan browser — cukup untuk admin internal
    if (!window.confirm(`Hapus video "${video.title}" beserta file-nya?`)) return
    await send(`/api/admin/videos/${video.id}`, "DELETE", new FormData())
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="mb-4 font-bricolage text-base font-bold">
          Tambah Video (file MP4/WebM atau link YouTube)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-title">Judul</Label>
            <Input
              id="v-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Sumber</Label>
            <select
              className="h-10 rounded-full border border-border bg-background px-4 text-sm shadow-xs focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as "file" | "youtube")}
            >
              <option value="file">File (MP4/WebM, maks 500 MB)</option>
              <option value="youtube">Link YouTube</option>
            </select>
          </div>
          {sourceType === "file" ? (
            <div key="field-file" className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="v-file">File video</Label>
              <Input
                key="v-file"
                id="v-file"
                type="file"
                accept={ACCEPT}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </div>
          ) : (
            <div key="field-youtube" className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="v-yt">URL YouTube</Label>
              <Input
                key="v-yt"
                id="v-yt"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="v-desc">Deskripsi (opsional)</Label>
            <Input
              id="v-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3">
          <Button type="submit" disabled={busy}>
            {busy ? "Menyimpan..." : "Tambah"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Ukuran</th>
              <th className="px-4 py-3">Diunggah</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada video. Upload yang pertama di atas.
                </td>
              </tr>
            )}
            {videos.map((video) =>
              editingId === video.id ? (
                <tr key={video.id} className="border-b align-top">
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
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Batal
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={video.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{video.title}</span>
                      {video.sourceType === "youtube" && (
                        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                          YouTube
                        </span>
                      )}
                    </div>
                    {video.description && (
                      <div className="text-xs text-muted-foreground">{video.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {video.sourceType === "youtube" ? "—" : formatBytes(video.fileSize)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(video.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(video.id)
                          setEditTitle(video.title)
                          setEditDescription(video.description ?? "")
                        }}
                      >
                        Ubah
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(video)}>
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
