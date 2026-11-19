"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  X,
  Play,
  Film,
  Tv,
  CheckCircle2,
  Clock,
  Lock,
  XCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBytes, formatDateTime } from "@/lib/format"
import type { AccessStatus } from "@/lib/access"

export interface KatalogVideoItem {
  id: string
  title: string
  description: string | null
  sourceType: string
  youtubeUrl: string | null
  thumbnailPath?: string | null
  fileSize: number
  mimeType: string
  createdAt: string
}

export interface KatalogExplorerProps {
  videos: KatalogVideoItem[]
  user: {
    id: string
    name: string
    role: string
  } | null
  initialAccessMap?: Record<string, { status: AccessStatus; expiresAt: string | null }>
}

function getYouTubeId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:embed\/|v=|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : null
}

export function KatalogExplorer({
  videos,
  user,
  initialAccessMap = {},
}: KatalogExplorerProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "file" | "youtube" | "ready">("all")
  const [accessMap, setAccessMap] = useState(initialAccessMap)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<{ id: string; msg: string } | null>(null)

  // Filter video
  const filtered = videos.filter((v) => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchTitle = v.title.toLowerCase().includes(q)
      const matchDesc = v.description?.toLowerCase().includes(q) ?? false
      if (!matchTitle && !matchDesc) return false
    }

    // Category
    if (categoryFilter === "file") return v.sourceType !== "youtube"
    if (categoryFilter === "youtube") return v.sourceType === "youtube"
    if (categoryFilter === "ready") {
      if (user?.role === "admin") return true
      const state = accessMap[v.id]
      return state?.status === "active"
    }

    return true
  })

  // Count items per category
  const fileCount = videos.filter((v) => v.sourceType !== "youtube").length
  const youtubeCount = videos.filter((v) => v.sourceType === "youtube").length
  const readyCount = videos.filter((v) => {
    if (user?.role === "admin") return true
    return accessMap[v.id]?.status === "active"
  }).length

  async function handleRequestAccess(videoId: string) {
    if (!user) {
      router.push(`/auth/login?callbackUrl=/videos/${videoId}`)
      return
    }

    setRequestingId(videoId)
    setRequestError(null)

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null

      if (!res.ok) {
        setRequestError({
          id: videoId,
          msg: data?.error ?? "Gagal mengirim permintaan izin",
        })
        return
      }

      // Update state lokal
      setAccessMap((prev) => ({
        ...prev,
        [videoId]: { status: "pending", expiresAt: null },
      }))
      router.refresh()
    } catch {
      setRequestError({
        id: videoId,
        msg: "Terjadi kesalahan jaringan",
      })
    } finally {
      setRequestingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Tabs Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari video berdasarkan judul..."
            className="w-full h-11 rounded-full border border-border/80 bg-background pl-11 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full border border-border/60 bg-muted/40 text-xs font-medium">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3.5 py-1.5 transition-all ${
              categoryFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua ({videos.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("file")}
            className={`rounded-full px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
              categoryFilter === "file"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            File MP4 ({fileCount})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("youtube")}
            className={`rounded-full px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
              categoryFilter === "youtube"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            YouTube ({youtubeCount})
          </button>
          {user && (
            <button
              type="button"
              onClick={() => setCategoryFilter("ready")}
              className={`rounded-full px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
                categoryFilter === "ready"
                  ? "bg-emerald-600 text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Siap Ditonton ({readyCount})
            </button>
          )}
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari{" "}
          {videos.length} video
        </span>
        {user ? (
          <span className="font-mono">
            Sesi: <span className="text-foreground font-medium">{user.name}</span> ({user.role})
          </span>
        ) : (
          <span className="font-mono text-muted-foreground">Mode Pengunjung (Tamu)</span>
        )}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <Film className="h-6 w-6" />
          </div>
          <h3 className="font-bricolage text-lg font-bold text-foreground">
            Tidak ada video yang cocok
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {search
              ? `Pencarian "${search}" tidak menemukan hasil. Coba kata kunci lain atau reset filter.`
              : "Belum ada video pada kategori ini."}
          </p>
          {(search || categoryFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full"
              onClick={() => {
                setSearch("")
                setCategoryFilter("all")
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      )}

      {/* Video Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const isYoutube = item.sourceType === "youtube"
          const ytId = isYoutube ? getYouTubeId(item.youtubeUrl) : null
          const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null

          const access = accessMap[item.id] ?? { status: "none", expiresAt: null }
          const canWatch = user?.role === "admin" || access.status === "active"
          const isPending = access.status === "pending"
          const isExpired = access.status === "expired"
          const isDenied = access.status === "denied"
          const isLoadingThis = requestingId === item.id
          const hasError = requestError?.id === item.id ? requestError.msg : null

          return (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 border border-border/50 mb-3.5 group/thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/videos/${item.id}/thumbnail`}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Play badge on hover */}
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg group-hover:scale-110 transition-transform ${
                        isYoutube ? "bg-red-600" : "bg-primary"
                      }`}
                    >
                      <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                    </span>
                  </div>

                  {/* Floating badges on thumbnail */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-xs backdrop-blur-md ${
                        isYoutube
                          ? "bg-red-500/90 text-white"
                          : "bg-primary/90 text-white"
                      }`}
                    >
                      {isYoutube ? "YouTube" : "File MP4"}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="rounded-full bg-black/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-white">
                      {isYoutube ? "Online Stream" : formatBytes(item.fileSize)}
                    </span>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  {user ? (
                    user.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-background px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        <Sparkles className="h-3 w-3" />
                        Akses Penuh Admin
                      </span>
                    ) : canWatch ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Akses Aktif
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Menunggu Persetujuan
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Akses Kedaluwarsa
                      </span>
                    ) : isDenied ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        <XCircle className="h-3 w-3" />
                        Ditolak Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Perlu Izin Tonton
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Tersedia untuk Customer
                    </span>
                  )}

                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatDateTime(item.createdAt).split(",")[0]}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bricolage text-base sm:text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs italic text-muted-foreground/70">
                    Tidak ada deskripsi tambahan.
                  </p>
                )}
              </div>

              {/* Action Buttons & Feedback */}
              <div className="mt-4 pt-3.5 border-t border-border/50 flex flex-col gap-2">
                {hasError && (
                  <p className="text-[11px] text-destructive leading-tight">{hasError}</p>
                )}

                {!user ? (
                  // Guest: Tonton Sekarang directs to login callback
                  <Link href={`/auth/login?callbackUrl=/videos/${item.id}`} className="w-full">
                    <Button className="w-full rounded-full text-xs font-semibold shadow-xs">
                      Tonton Sekarang &rarr;
                    </Button>
                  </Link>
                ) : canWatch ? (
                  // Active Access or Admin
                  <div className="flex flex-col gap-1">
                    <Link href={`/videos/${item.id}`} className="w-full">
                      <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs">
                        Tonton Sekarang &rarr;
                      </Button>
                    </Link>
                    {user.role === "customer" && access.expiresAt && (
                      <p className="text-[10px] text-center text-muted-foreground font-mono">
                        Aktif sampai {formatDateTime(access.expiresAt)}
                      </p>
                    )}
                  </div>
                ) : isPending ? (
                  // Pending
                  <Link href="/requests" className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full rounded-full text-xs font-medium text-amber-600 dark:text-amber-400"
                    >
                      Menunggu Persetujuan &rarr;
                    </Button>
                  </Link>
                ) : (
                  // None, Expired, or Denied
                  <Button
                    className="w-full rounded-full text-xs font-semibold"
                    disabled={isLoadingThis}
                    onClick={() => handleRequestAccess(item.id)}
                  >
                    {isLoadingThis
                      ? "Mengirim..."
                      : isExpired
                        ? "Minta Akses Ulang"
                        : isDenied
                          ? "Ajukan Ulang Izin"
                          : "Minta Izin Tonton"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
