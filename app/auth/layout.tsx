import React from "react"
import Link from "next/link"
import { AuthMosaic } from "@/components/auth/auth-mosaic"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col lg:flex-row bg-[#0c0c0e] text-white overflow-y-auto lg:overflow-hidden select-none">
      {/* Left Panel: Form Content */}
      <div className="flex flex-col justify-between w-full lg:w-[50%] xl:w-[45%] min-h-screen p-6 sm:p-10 lg:p-12 bg-[#0c0c0e] z-10 border-r border-neutral-900/80">
        {/* Top Header / Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors group"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 group-hover:bg-primary group-hover:text-white transition-colors text-[10px]">
              &larr;
            </span>
            <span>Kembali ke Beranda</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs">
              Y
            </span>
            <span className="font-bricolage font-bold text-sm tracking-tight text-white">
              Video<span className="text-primary">Stream</span>
            </span>
          </Link>
        </div>

        {/* Center Form Area */}
        <div className="my-auto py-8 w-full max-w-sm mx-auto">
          {children}
        </div>

        {/* Bottom Terms & Disclaimer (matching Mobbin) */}
        <div className="pt-6 text-center">
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="#" className="text-neutral-400 underline underline-offset-2 hover:text-white">
              Ketentuan Layanan
            </Link>{" "}
            dan{" "}
            <Link href="#" className="text-neutral-400 underline underline-offset-2 hover:text-white">
              Kebijakan Privasi
            </Link>{" "}
            VideoStream.
          </p>
        </div>
      </div>

      {/* Right Panel: Tilted Isometric App Showcase Mosaic (matching Mobbin) */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-950 overflow-hidden">
        <AuthMosaic />
      </div>
    </div>
  )
}
