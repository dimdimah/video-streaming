import Link from "next/link"
import { desc } from "drizzle-orm"
import { requireUser } from "@/lib/auth"
import { getVideoAccess } from "@/lib/access"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { formatBytes } from "@/lib/format"
import { StatusBadge } from "@/components/status-badge"
import { RequestAccessButton } from "@/components/request-access-button"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

/** Daftar video: customer melihat status akses + tombol minta; admin bisa langsung buka. */
export default async function VideosPage() {
  const user = await requireUser()

  const videos = await db.select().from(video).orderBy(desc(video.createdAt))
  const states = await Promise.all(videos.map((v) => getVideoAccess(user.id, v.id)))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 border-b border-border/60 pb-4">
        <h1 className="font-bricolage text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Daftar Video
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Minta akses ke video yang diinginkan, lalu tonton selama masa aktif yang disetujui admin.
        </p>
      </div>

      {videos.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Belum ada video.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v, i) => {
          const state = states[i]
          const isYoutube = v.sourceType === "youtube"
          return (
            <div
              key={v.id}
              className="group flex flex-col justify-between gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 border border-border/50 mb-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/videos/${v.id}/thumbnail`}
                    alt={v.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        isYoutube
                          ? "bg-red-500/90 text-white"
                          : "bg-primary/90 text-white"
                      }`}
                    >
                      {isYoutube ? "YouTube" : "Video MP4"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {isYoutube ? "Online Stream" : formatBytes(v.fileSize)}
                  </span>
                  {user.role === "customer" && state.status !== "none" && (
                    <StatusBadge status={state.status} />
                  )}
                </div>
                <h2 className="font-bricolage text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-1">
                  {v.title}
                </h2>
                {v.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                )}
              </div>
              <div className="mt-2 pt-3 border-t border-border/50">
                {user.role === "admin" || state.status === "active" ? (
                  <Link href={`/videos/${v.id}`}>
                    <Button className="w-full rounded-full">Tonton Sekarang</Button>
                  </Link>
                ) : (
                  <RequestAccessButton videoId={v.id} status={state.status} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
