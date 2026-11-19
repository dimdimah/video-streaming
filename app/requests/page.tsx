import Link from "next/link"
import { redirect } from "next/navigation"
import { desc, eq } from "drizzle-orm"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { video, videoAccess } from "@/lib/schema"
import { formatDateTime } from "@/lib/format"
import { StatusBadge } from "@/components/status-badge"
import { RequestAccessButton } from "@/components/request-access-button"

export const dynamic = "force-dynamic"

/** Riwayat permintaan akses milik customer yang login. */
export default async function RequestsPage() {
  const user = await requireUser()
  if (user.role === "admin") redirect("/admin/requests")

  const rows = await db
    .select({
      id: videoAccess.id,
      videoId: videoAccess.videoId,
      status: videoAccess.status,
      requestedAt: videoAccess.requestedAt,
      expiresAt: videoAccess.expiresAt,
      videoTitle: video.title,
    })
    .from(videoAccess)
    .innerJoin(video, eq(videoAccess.videoId, video.id))
    .where(eq(videoAccess.userId, user.id))
    .orderBy(desc(videoAccess.requestedAt))

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 border-b border-border/60 pb-4">
        <h1 className="font-bricolage text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Permintaan Saya
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau status perizinan dan masa aktif akses video Anda di sini.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Diminta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Berlaku s/d</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada permintaan. Pilih video di{" "}
                  <Link href="/videos" className="underline underline-offset-4">
                    halaman Video
                  </Link>
                  .
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const isExpiredApproved =
                row.status === "approved" &&
                (!row.expiresAt || new Date(row.expiresAt) <= new Date())
              const canReRequest =
                row.status === "denied" ||
                (row.status === "approved" && isExpiredApproved)
              return (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/videos/${row.videoId}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {row.videoTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(row.requestedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={
                        row.status === "approved"
                          ? isExpiredApproved
                            ? "expired"
                            : "active"
                          : row.status
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.status === "approved" ? formatDateTime(row.expiresAt) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canReRequest && (
                      <RequestAccessButton videoId={row.videoId} status={row.status === "denied" ? "denied" : "expired"} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
