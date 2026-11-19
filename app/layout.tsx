import { Bricolage_Grotesque, Work_Sans, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { AuthNav } from "@/components/auth-nav"
import Link from "next/link"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        workSans.variable,
        bricolage.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground font-sans relative">
        <ThemeProvider>
          {/* Floating Pill Header ala yapp.ink */}
          <header className="fixed top-5 inset-x-0 w-full px-4 z-50 pointer-events-none">
            <nav className="pointer-events-auto h-16 border border-border/80 bg-background/70 backdrop-blur-md rounded-full flex items-center justify-between max-w-6xl mx-auto px-6 shadow-xs">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
                  V
                </span>
                <span className="font-bricolage font-bold text-lg tracking-tight text-foreground">
                  Video<span className="text-primary">Stream</span>
                </span>
              </Link>
              <AuthNav />
            </nav>
          </header>

          <main className="pt-24 pb-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
