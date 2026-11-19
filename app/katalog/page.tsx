import { headers } from "next/headers"
import { desc } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { getVideoAccess, type AccessStatus } from "@/lib/access"
import { KatalogExplorer, type KatalogVideoItem } from "@/components/katalog-explorer"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Katalog Video Streaming",
  description: "Jelajahi dan tonton berbagai koleksi video streaming berkualitas tinggi.",
}

export default async function KatalogPage() {
  const headerList = await headers()
  const session = await getCurrentSession(headerList).catch(() => null)
  const user = session?.user ?? null

  const rows = await db.select().from(video).orderBy(desc(video.createdAt))

  const accessMap: Record<string, { status: AccessStatus; expiresAt: string | null }> = {}

  if (user) {
    const states = await Promise.all(rows.map((v) => getVideoAccess(user.id, v.id)))
    rows.forEach((v, i) => {
      accessMap[v.id] = {
        status: states[i].status,
        expiresAt: states[i].expiresAt ? states[i].expiresAt.toISOString() : null,
      }
    })
  }

  const serializedVideos: KatalogVideoItem[] = rows.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    sourceType: v.sourceType,
    youtubeUrl: v.youtubeUrl,
    thumbnailPath: v.thumbnailPath,
    fileSize: v.fileSize,
    mimeType: v.mimeType,
    createdAt: v.createdAt.toISOString(),
  }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="font-bricolage text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Koleksi video untuk kamu
        </h1>
      </div>

      {/* Interactive Catalog Explorer */}
      <KatalogExplorer
        videos={serializedVideos}
        user={user ? { id: user.id, name: user.name, role: user.role } : null}
        initialAccessMap={accessMap}
      />
    </div>
  )
}
