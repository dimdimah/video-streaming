import React from "react"
import Link from "next/link"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { video } from "@/lib/schema"
import { AuthMosaic } from "@/components/auth/auth-mosaic"

export const dynamic = "force-dynamic"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const videos = await db
    .select({
      id: video.id,
      title: video.title,
      sourceType: video.sourceType,
      fileSize: video.fileSize,
    })
    .from(video)
    .orderBy(desc(video.createdAt))
    .catch(() => [])

  return (
    <div className="light fixed inset-0 z-[60] flex flex-col lg:flex-row bg-white text-neutral-900 overflow-y-auto lg:overflow-hidden select-none [color-scheme:light]">
      {/* Left Panel: Form Content (Light Mode) */}
      <div className="flex flex-col justify-between w-full lg:w-[48%] xl:w-[42%] min-h-screen p-6 sm:p-10 lg:p-12 bg-white z-10 border-r border-neutral-200">
        {/* Top Header Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              G
            </span>
            <span className="font-bricolage font-bold text-base tracking-tight text-neutral-900">
              gate<span className="text-primary">k</span>
            </span>
          </Link>
        </div>

        {/* Center Form Area */}
        <div className="my-auto py-8 w-full max-w-sm mx-auto">
          {children}
        </div>

        {/* Bottom Terms & Disclaimer */}
        <div className="pt-6 text-center">
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="#" className="text-neutral-900 underline underline-offset-2 hover:text-primary">
              Ketentuan Layanan
            </Link>{" "}
            dan{" "}
            <Link href="#" className="text-neutral-900 underline underline-offset-2 hover:text-primary">
              Kebijakan Privasi
            </Link>{" "}
            gatek.
          </p>
        </div>
      </div>

      {/* Right Panel: Video Mosaic dari Hero Section */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-100/60 overflow-hidden">
        <AuthMosaic items={videos} />
      </div>
    </div>
  )
}
