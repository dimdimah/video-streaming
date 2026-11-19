import { desc, eq } from "drizzle-orm"
import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import { user as userTable, video, videoAccess } from "@/lib/schema"
import { RequestsManager } from "@/components/admin/requests-manager"

export const dynamic = "force-dynamic"

export default async function AdminRequestsPage() {
  await requireRole("admin")

  const requests = await db
    .select({
      id: videoAccess.id,
      status: videoAccess.status,
      requestedAt: videoAccess.requestedAt,
      decidedAt: videoAccess.decidedAt,
      expiresAt: videoAccess.expiresAt,
      videoTitle: video.title,
      customerName: userTable.name,
    })
    .from(videoAccess)
    .innerJoin(video, eq(videoAccess.videoId, video.id))
    .innerJoin(userTable, eq(videoAccess.userId, userTable.id))
    .orderBy(desc(videoAccess.requestedAt))

  return <RequestsManager requests={requests} />
}
