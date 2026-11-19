"use client"

import React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatBytes } from "@/lib/format"

export interface HeroMarqueeItem {
  id: string
  title: string
  sourceType: string
  fileSize: number
}

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
}

interface AnimatedMarqueeHeroProps {
  tagline: string
  title: string
  description: string
  /** Tombol CTA mengikuti sesi (tamu / customer / admin) dari halaman pemanggil. */
  children: React.ReactNode
  /** Katalog video asli — jadi isi marquee, bukan gambar stok karangan. */
  items: HeroMarqueeItem[]
  className?: string
}

/**
 * Hero + marquee katalog di bawahnya. Marquee menampilkan kartu video asli
 * dari DB; kalau katalog kosong, marquee tidak dirender (tidak ada konten
 * palsu). Menghormati prefers-reduced-motion: tanpa animasi sama sekali.
 */
export function AnimatedMarqueeHero({
  tagline,
  title,
  description,
  children,
  items,
  className,
}: AnimatedMarqueeHeroProps) {
  const reduceMotion = useReducedMotion()
  const duplicated = [...items, ...items]

  return (
    <section
      className={cn(
        "relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-56 text-center",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[560px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(88,42,240,0.14),transparent_70%)]" />

      <div className="z-10 flex max-w-3xl flex-col items-center">
        <motion.div
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          variants={FADE_UP}
          className="mb-6 inline-flex h-8 rounded-full bg-gradient-to-r from-[#DA35FF] via-[#008CFF] to-[#00D9FF] p-[1px] shadow-[0px_4px_4px_0px_#0000001A]"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-background px-4 text-xs font-medium text-transparent sm:text-sm">
            <span className="bg-gradient-to-r from-[#DA35FF] to-[#008CFF] bg-clip-text">
              {tagline}
            </span>
          </span>
        </motion.div>

        <motion.h1
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="font-bricolage text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          {title.split(" ").map((word, i) => (
            <motion.span key={`${word}-${i}`} variants={FADE_UP} className="inline-block">
              {word}&nbsp;
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          variants={FADE_UP}
          transition={{ delay: 0.3 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {description}
        </motion.p>

        <motion.div
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          variants={FADE_UP}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {children}
        </motion.div>
      </div>

      {items.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-56 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_85%,transparent)]">
          <motion.div
            className="flex gap-4"
            animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          >
            {duplicated.map((item, index) => {
              const isYoutube = item.sourceType === "youtube"
              return (
                <div
                  key={`${item.id}-${index}`}
                  style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
                  className="flex h-40 w-56 shrink-0 flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm md:h-52 md:w-64"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                        isYoutube
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-primary-background text-primary"
                      )}
                    >
                      {isYoutube ? "YouTube" : "Video File"}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {isYoutube ? "Online" : formatBytes(item.fileSize)}
                    </span>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play size={18} fill="currentColor" aria-hidden="true" />
                  </span>

                  <div>
                    <p className="line-clamp-2 font-bricolage text-sm font-bold leading-snug">
                      {item.title}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {items.length} video · katalog berputar
                    </p>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>
      )}
    </section>
  )
}
