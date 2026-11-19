"use client"

import React, { useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AuthMosaicItem {
  id: string
  title: string
  sourceType: string
  fileSize?: number
}

interface AuthMosaicProps {
  items?: AuthMosaicItem[]
}

const DEFAULT_AUTH_VIDEOS: AuthMosaicItem[] = [
  { id: "v1", title: "Santai Menikmati Kuliner Nusantara", sourceType: "mp4" },
  { id: "v2", title: "Resep Spesial Masakan Rumahan", sourceType: "youtube" },
  { id: "v3", title: "Eksplorasi Street Food Malam", sourceType: "mp4" },
  { id: "v4", title: "Cerita di Balik Meja Makan", sourceType: "youtube" },
  { id: "v5", title: "Mukbang Santai Menu Favorit", sourceType: "mp4" },
  { id: "v6", title: "Sensasi Cita Rasa Tradisional", sourceType: "youtube" },
]

function prepareRowItems(
  items: AuthMosaicItem[],
  rowOffset: number,
  minCount = 10
): AuthMosaicItem[] {
  const pool = items && items.length > 0 ? items : DEFAULT_AUTH_VIDEOS
  let list = [...pool]
  while (list.length < minCount) {
    list = [...list, ...pool]
  }
  const offset = rowOffset % list.length
  const shifted = [...list.slice(offset), ...list.slice(0, offset)]
  return [...shifted, ...shifted]
}

export function AuthMosaic({ items = [] }: AuthMosaicProps) {
  const reduceMotion = useReducedMotion()

  // 4 baris mosaik video miring bergerak ke arah kiri seperti di hero section
  const row1 = useMemo(() => prepareRowItems(items, 0, 10), [items])
  const row2 = useMemo(() => prepareRowItems(items, 2, 10), [items])
  const row3 = useMemo(() => prepareRowItems(items, 4, 10), [items])
  const row4 = useMemo(() => prepareRowItems(items, 1, 10), [items])

  const rows = [
    { items: row1, duration: 46 },
    { items: row2, duration: 38 },
    { items: row3, duration: 52 },
    { items: row4, duration: 42 },
  ]

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-100/60 flex items-center justify-center select-none">
      {/* ============================================================
          LAPISAN 1: Mosaik Thumbnail Video Miring (Animasi Gerak ke Kiri)
          Persis seperti Hero Section
          ============================================================ */}
      <div className="pointer-events-none absolute -inset-y-36 -inset-x-28 sm:-inset-x-44 overflow-hidden select-none">
        <div className="flex flex-col gap-4 sm:gap-5 -rotate-6 scale-125 sm:scale-110 origin-center justify-center h-full">
          {rows.map((row, rowIdx) => (
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
                      className="group relative aspect-video w-56 sm:w-64 shrink-0 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition-transform hover:scale-[1.02]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/videos/${item.id}/thumbnail`}
                        alt={item.title}
                        className="h-full w-full object-cover opacity-95"
                        loading="lazy"
                      />

                      {/* Vignette Gelap Bawah untuk Keterbacaan Judul */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Label Judul & Format Badge */}
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
          ))}
        </div>
      </div>

      {/* ============================================================
          LAPISAN 2: Frosted Focus Overlay (Light Mode Bersih)
          ============================================================ */}
      {/* 2a. Tint Tipis Transparan */}
      <div className="pointer-events-none absolute inset-0 bg-white/40 backdrop-blur-[0.5px]" />

      {/* 2b. Radial Spotlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.2)_55%,rgba(255,255,255,0.65)_100%)]" />

      {/* 2c. Ambient Purple Tint yapp.ink */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-[550px] bg-[radial-gradient(ellipse_70%_50%_at_50%_15%,rgba(88,42,240,0.12),transparent_75%)]" />

      {/* 2d. Fade halus ke batas kiri layout & atas-bawah */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/60 to-transparent" />

      {/* ============================================================
          LAPISAN 3: Floating Caption Minimalis
          ============================================================ */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-sm pointer-events-none">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/90 px-4 py-1.5 text-xs font-semibold text-neutral-800 shadow-md backdrop-blur-md mb-2.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Katalog Video Pilihan</span>
        </div>
        <h3 className="font-bricolage text-xl font-bold text-neutral-900 tracking-tight drop-shadow-xs">
          Buka Gerbang Tontonan Favoritmu
        </h3>
        <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed font-medium">
          Makan makin nikmat ditemani streaming video lancar dan berizin.
        </p>
      </div>
    </div>
  )
}
