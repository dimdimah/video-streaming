import { desc } from "drizzle-orm"
import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { VideosManager } from "@/components/admin/videos-manager"

export const dynamic = "force-dynamic"

export default async function AdminVideosPage() {
  await requireRole("admin")

  const videos = await db
    .select({
      id: video.id,
      title: video.title,
      description: video.description,
      fileSize: video.fileSize,
      sourceType: video.sourceType,
      youtubeUrl: video.youtubeUrl,
      thumbnailPath: video.thumbnailPath,
      createdAt: video.createdAt,
    })
    .from(video)
    .orderBy(desc(video.createdAt))

  return <VideosManager videos={videos} />
}
