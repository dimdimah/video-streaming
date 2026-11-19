import Link from "next/link"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { requireUser } from "@/lib/auth"
import { getVideoAccess } from "@/lib/access"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { formatBytes, formatDateTime } from "@/lib/format"
import { StatusBadge } from "@/components/status-badge"
import { RequestAccessButton } from "@/components/request-access-button"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

/** Detail video + player (bila akses aktif) atau status permintaan. */
export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params

  const rows = await db.select().from(video).where(eq(video.id, id)).limit(1)
  const row = rows[0]
  if (!row) notFound()

  const state = await getVideoAccess(user.id, id)
  const canWatch = user.role === "admin" || state.status === "active"

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Link
        href="/videos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        &larr; Kembali ke daftar video
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bricolage text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {row.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {row.sourceType === "youtube"
              ? "YouTube"
              : formatBytes(row.fileSize)}{" "}
            &middot; diunggah {formatDateTime(row.createdAt)}
          </p>
        </div>
        {user.role === "customer" && state.status !== "none" && (
          <StatusBadge status={state.status} />
        )}
      </div>

      {row.description && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{row.description}</p>
      )}

      <div className="mt-6">
        {canWatch ? (
          row.sourceType === "youtube" && row.youtubeUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-3xl border border-border/80 bg-black shadow-md">
              <iframe
                src={row.youtubeUrl}
                title={row.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              controls
              preload="metadata"
              poster={`/api/videos/${row.id}/thumbnail`}
              className="aspect-video w-full rounded-3xl border border-border/80 bg-black shadow-md object-contain"
              src={`/api/videos/${row.id}/play`}
            >
              Browser Anda tidak mendukung pemutaran video.
            </video>
          )
        ) : (
          <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
            {state.status === "active" ? null : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {state.status === "pending" &&
                  "Anda sudah mengirim permintaan — menunggu persetujuan admin."}
                {state.status === "expired" &&
                  `Akses Anda sudah kedaluwarsa${state.expiresAt ? ` sejak ${formatDateTime(state.expiresAt)}` : ""}. Ajukan permintaan ulang untuk menonton kembali.`}
                {state.status === "denied" &&
                  "Permintaan terakhir Anda ditolak admin. Anda dapat mengajukan ulang."}
                {state.status === "none" && "Anda belum memiliki akses ke video ini."}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <RequestAccessButton videoId={row.id} status={state.status} />
              <Link href="/requests">
                <Button variant="outline" className="w-full sm:w-auto rounded-full">
                  Lihat riwayat permintaan
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {canWatch && user.role === "customer" && state.expiresAt && (
        <p className="mt-3 text-sm text-muted-foreground">
          Akses berlaku sampai {formatDateTime(state.expiresAt)}.
        </p>
      )}
    </div>
  )
}
