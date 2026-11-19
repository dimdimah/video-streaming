import Link from "next/link"
import { headers } from "next/headers"
import { desc } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { Button } from "@/components/ui/button"
import { AnimatedMarqueeHero } from "@/components/ui/hero-3"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const headerList = await headers()
  const session = await getCurrentSession(headerList).catch(() => null)
  const user = session?.user ?? null

  const videos = await db.select().from(video).orderBy(desc(video.createdAt))

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 pb-16">
      <AnimatedMarqueeHero
        tagline="Katalog video dengan izin tonton bertempo"
        title="Unggah video, pilih siapa yang boleh menonton, tentukan sampai kapan."
        description="Satu tempat untuk file MP4/WebM dan link YouTube. Customer mengajukan akses, admin menyetujui dengan durasi 1–720 jam, dan player hanya mengirim byte setelah izin dicek."
        items={videos}
      >
        {!user && (
          <>
            <Link href="/auth/register">
              <Button size="lg" className="h-12 rounded-full px-7 text-base font-medium shadow-xs">
                Daftar Akun
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-full px-7 text-base font-medium"
              >
                Masuk
              </Button>
            </Link>
          </>
        )}
        {user?.role === "customer" && (
          <>
            <Link href="/videos">
              <Button size="lg" className="h-12 rounded-full px-7 text-base font-medium shadow-xs">
                Katalog Video
              </Button>
            </Link>
            <Link href="/requests">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-full px-7 text-base font-medium"
              >
                Permintaan Saya
              </Button>
            </Link>
          </>
        )}
        {user?.role === "admin" && (
          <Link href="/admin">
            <Button size="lg" className="h-12 rounded-full px-7 text-base font-medium shadow-xs">
              Panel Admin Dashboard
            </Button>
          </Link>
        )}
        {user && (
          <p className="w-full text-xs font-medium text-muted-foreground">
            Masuk sebagai <span className="text-foreground">{user.name}</span> ({user.role})
          </p>
        )}
      </AnimatedMarqueeHero>
    </div>
  )
}
