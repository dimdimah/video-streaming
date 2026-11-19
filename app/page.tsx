import Link from "next/link"
import { headers } from "next/headers"
import { desc } from "drizzle-orm"
import { getCurrentSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { Button } from "@/components/ui/button"
import { AnimatedMarqueeHero } from "@/components/ui/hero-3"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "gatek — Temani Makanmu Sambil Nonton",
  description:
    "Biar makan nggak sepi dan makin lahap. Buka gerbang tontonan favoritmu dengan satu klik di Gatek.",
}

export default async function HomePage() {
  const headerList = await headers()
  const session = await getCurrentSession(headerList).catch(() => null)
  const user = session?.user ?? null

  const videos = await db.select().from(video).orderBy(desc(video.createdAt))

  return (
    <div className="relative -mt-24 -mb-16 h-[100dvh] w-full overflow-hidden flex flex-col justify-center">
      <AnimatedMarqueeHero
        title="Gatek temani makanmu sambil nonton video pilihan."
        description="Biar makan nggak sepi dan makin lahap. Buka gerbang tontonan favoritmu dengan satu klik, nikmati streaming lancar selama santap hidangan."
        items={videos}
      >
        <Link href="/katalog">
          <Button
            size="lg"
            className="h-12 rounded-full px-8 text-base font-medium shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Pilih Tontonan
          </Button>
        </Link>
        {user && (
          <p className="w-full text-xs font-medium text-muted-foreground">
            Masuk sebagai <span className="text-foreground font-semibold">{user.name}</span> ({user.role})
            {user.role === "admin" && (
              <>
                {" "}
                &middot;{" "}
                <Link href="/admin" className="underline hover:text-primary">
                  Buka Dashboard Admin
                </Link>
              </>
            )}
          </p>
        )}
      </AnimatedMarqueeHero>
    </div>
  )
}
