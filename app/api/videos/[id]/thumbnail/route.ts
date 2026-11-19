import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"

function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return m ? m[1] : null
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "&":
        return "&amp;"
      case "'":
        return "&apos;"
      case '"':
        return "&quot;"
      default:
        return c
    }
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await db.select().from(video).where(eq(video.id, id)).limit(1)
  const row = rows[0]

  if (!row) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // 1. Jika ada file thumbnail fisik tersimpan
  if (row.thumbnailPath) {
    try {
      const fullPath = path.join(process.cwd(), row.thumbnailPath)
      const buffer = await readFile(fullPath)
      const ext = path.extname(row.thumbnailPath).toLowerCase()
      const contentType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : "image/jpeg"

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      })
    } catch {
      // File fisik tidak ditemukan di disk, fallback ke opsi berikutnya
    }
  }

  // 2. Jika sumber YouTube, redirect ke thumbnail bawaan YouTube
  if (row.sourceType === "youtube" && row.youtubeUrl) {
    const ytId = parseYouTubeId(row.youtubeUrl)
    if (ytId) {
      return NextResponse.redirect(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`, {
        status: 307,
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      })
    }
  }

  // 3. Fallback: craft SVG poster dengan warna signature yapp.ink
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" fill="none">
    <rect width="640" height="360" fill="#181524"/>
    <circle cx="320" cy="180" r="44" fill="#582af0" fill-opacity="0.25"/>
    <circle cx="320" cy="180" r="32" fill="#582af0"/>
    <polygon points="314,166 332,180 314,194" fill="#ffffff"/>
    <text x="320" y="246" text-anchor="middle" fill="#a3a3a3" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500">${escapeXml(row.title)}</text>
  </svg>`

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
