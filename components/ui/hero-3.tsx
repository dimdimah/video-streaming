"use client"

import React, { useMemo } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

export interface HeroMarqueeItem {
  id: string
  title: string
  sourceType: string
  fileSize: number
}

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
}

interface AnimatedMarqueeHeroProps {
  tagline?: string
  title: string
  description: string
  children: React.ReactNode
  items: HeroMarqueeItem[]
  className?: string
}

/**
 * Gandakan dan geser urutan item per baris agar mosaik tampak dinamis & penuh
 */
function prepareRowItems(
  items: HeroMarqueeItem[],
  rowOffset: number,
  minCount = 10
): HeroMarqueeItem[] {
  if (!items || items.length === 0) return []
  let list = [...items]
  while (list.length < minCount) {
    list = [...list, ...items]
  }
  const offset = rowOffset % list.length
  const shifted = [...list.slice(offset), ...list.slice(0, offset)]
  // Gandakan dua kali untuk animasi tanpa jeda 0% -> -50%
  return [...shifted, ...shifted]
}

export function AnimatedMarqueeHero({
  tagline,
  title,
  description,
  children,
  items,
  className,
}: AnimatedMarqueeHeroProps) {
  const reduceMotion = useReducedMotion()

  // 4 baris mosaik miring bergerak kontinu ke arah kiri
  const row1 = useMemo(() => prepareRowItems(items, 0, 10), [items])
  const row2 = useMemo(() => prepareRowItems(items, 2, 10), [items])
  const row3 = useMemo(() => prepareRowItems(items, 4, 10), [items])
  const row4 = useMemo(() => prepareRowItems(items, 1, 10), [items])

  const rows = [
    { items: row1, duration: 44 },
    { items: row2, duration: 36 },
    { items: row3, duration: 48 },
    { items: row4, duration: 40 },
  ]

  return (
    <section
      className={cn(
        "relative flex h-full min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 py-16 text-center select-none",
        className
      )}
    >
      {/* ============================================================
          LAPISAN 1: Mosaik Thumbnail Video Miring (Animasi Gerak ke Kiri)
          Thumbnail dibuat lebih jelas, kaya warna, dan tidak buram
          ============================================================ */}
      <div className="pointer-events-none absolute -inset-y-36 -inset-x-24 sm:-inset-x-36 overflow-hidden select-none">
        <div className="flex flex-col gap-4 sm:gap-5 -rotate-6 scale-125 sm:scale-110 origin-center justify-center h-full">
          {rows.map((row, rowIdx) => {
            if (row.items.length === 0) {
              return (
                <div key={rowIdx} className="flex gap-4 sm:gap-5 opacity-20 justify-center">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-video w-52 sm:w-64 shrink-0 rounded-2xl border border-border bg-muted/40"
                    />
                  ))}
                </div>
              )
            }

            return (
              <div key={rowIdx} className="flex overflow-hidden">
                <motion.div
                  className="flex gap-4 sm:gap-5 shrink-0"
                  animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
                  transition={{
                    ease: "linear",
                    duration: row.duration,
                    repeat: Infinity,
                  }}
                >
                  {row.items.map((item, itemIdx) => {
                    const isYoutube = item.sourceType === "youtube"
                    return (
                      <div
                        key={`${item.id}-${rowIdx}-${itemIdx}`}
                        className="group relative aspect-video w-52 sm:w-64 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-transform hover:scale-[1.02]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/videos/${item.id}/thumbnail`}
                          alt={item.title}
                          className="h-full w-full object-cover opacity-95 dark:opacity-85"
                          loading="lazy"
                        />

                        {/* Kartu Vignette Bawah untuk Judul */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                        {/* Label Judul & Tipe */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                          <span className="line-clamp-1 text-[11px] font-semibold text-white drop-shadow-sm text-left">
                            {item.title}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs",
                              isYoutube
                                ? "bg-red-600/90 text-white"
                                : "bg-primary text-white"
                            )}
                          >
                            {isYoutube ? "YT" : "MP4"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================================
          LAPISAN 2: Frosted Focus Overlay (Diperjelas & Tidak Putih Mati)
          Lebih transparan agar poster video tampak jelas di latar belakang
          ============================================================ */}
      {/* 2a. Tint Tipis Transparan (Poster tetap terlihat jelas) */}
      <div className="pointer-events-none absolute inset-0 bg-background/45 dark:bg-background/60 backdrop-blur-[1px]" />

      {/* 2b. Radial Spotlight: Fokus terang di belakang teks, transparan di area sekitar */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.45)_55%,rgba(255,255,255,0.7)_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(9,9,11,0.85)_0%,rgba(9,9,11,0.45)_55%,rgba(9,9,11,0.85)_100%)]" />

      {/* 2c. Ambient Purple Tint yapp.ink */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-[550px] bg-[radial-gradient(ellipse_70%_50%_at_50%_15%,rgba(88,42,240,0.1),transparent_75%)]" />

      {/* 2d. Halus Memudar ke Header dan Batas Halaman */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/70 to-transparent" />

      {/* ============================================================
          LAPISAN 3: Konten Utama Hero Section (Standar Craft yapp.ink)
          ============================================================ */}
      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        {/* Pill Tagline Signature (jika ada) */}
        {tagline && (
          <motion.div
            initial={reduceMotion ? "show" : "hidden"}
            animate="show"
            variants={FADE_UP}
            className="mb-6 inline-flex h-8 items-center gap-2 rounded-full border border-primary/25 bg-primary-background/90 px-4 py-1 text-xs font-semibold text-primary shadow-xs backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>{tagline}</span>
          </motion.div>
        )}

        {/* Judul Utama H1 - Bricolage Grotesque Tegas */}
        <motion.h1
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="font-bricolage text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] dark:drop-shadow-none"
        >
          {title.split(" ").map((word, i) => (
            <motion.span key={`${word}-${i}`} variants={FADE_UP} className="inline-block">
              {word}&nbsp;
            </motion.span>
          ))}
        </motion.h1>

        {/* Deskripsi Faktual & Bersih */}
        <motion.p
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          variants={FADE_UP}
          transition={{ delay: 0.3 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base font-normal"
        >
          {description}
        </motion.p>

        {/* Tombol CTA Tunggal Kapsul */}
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
    </section>
  )
}
