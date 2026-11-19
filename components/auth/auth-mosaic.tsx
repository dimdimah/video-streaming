"use client"

import React from "react"
import { Play, ShieldCheck, Film, Radio, Sparkles, Clock, CheckCircle2 } from "lucide-react"

export function AuthMosaic() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0c0e] flex items-center justify-center select-none">
      {/* Vignette Gradients for infinite depth effect (matching Mobbin) */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-[#0c0c0e] via-transparent to-[#0c0c0e]/40" />
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-[#0c0c0e] via-transparent to-[#0c0c0e]" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl z-10" />

      {/* Tilted Isometric Cards Container */}
      <div className="flex gap-4 sm:gap-6 rotate-[-10deg] scale-105 sm:scale-110 -translate-y-4">
        {/* Column 1 */}
        <div className="flex flex-col gap-4 animate-in fade-in duration-700">
          {/* Card 1: Film Showcase */}
          <div className="w-56 sm:w-64 rounded-3xl border border-neutral-800/80 bg-neutral-900/90 p-4 shadow-xl backdrop-blur-md">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-800 bg-gradient-to-br from-neutral-800 to-neutral-950 flex flex-col justify-between p-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md flex items-center gap-1">
                  <Film className="h-3 w-3 text-primary" /> 4K HDR
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  1080p 60fps
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md self-center text-white shadow-lg">
                <Play className="h-4 w-4 fill-white ml-0.5" />
              </div>
              <div className="text-[11px] font-mono text-neutral-400">01:42:10 / 02:30:00</div>
            </div>
            <div className="mt-3">
              <h4 className="font-bricolage text-sm font-bold text-white leading-tight">
                Interstellar Journey
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Masterclass Documentary</p>
            </div>
          </div>

          {/* Card 2: Access Permission Approved */}
          <div className="w-56 sm:w-64 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> Akses Aktif
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Sisa 24 Jam</span>
            </div>
            <p className="font-bricolage text-xs font-semibold text-white">
              Izin Streaming Disetujui
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-neutral-800/60 p-2 border border-neutral-700/40">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                D
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-white truncate">Customer Premium</div>
                <div className="text-[9px] text-neutral-400">Token Terenkripsi</div>
              </div>
            </div>
          </div>

          {/* Card 3: Live Session */}
          <div className="w-56 sm:w-64 rounded-3xl border border-neutral-800/80 bg-neutral-900/90 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                <Radio className="h-3 w-3 animate-pulse" /> LIVE STREAM
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">1.8k nonton</span>
            </div>
            <div className="h-20 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Column 2 (Offset staggered upwards) */}
        <div className="flex flex-col gap-4 -translate-y-8 animate-in fade-in duration-1000">
          {/* Card 4: Audio / Waveform Player */}
          <div className="w-56 sm:w-64 rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#171126] p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </div>
              <div>
                <h5 className="font-bricolage text-xs font-bold text-white">Cinematic Soundscape</h5>
                <p className="text-[10px] text-neutral-400">Original Soundtrack</p>
              </div>
            </div>
            {/* Fake Waveform bars */}
            <div className="mt-4 flex items-end justify-between h-8 gap-1 px-1">
              {[40, 65, 30, 85, 95, 45, 70, 50, 90, 60, 40, 75, 55, 80, 45, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${i < 8 ? "bg-primary" : "bg-neutral-700"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 5: Big Poster Card */}
          <div className="w-56 sm:w-64 rounded-3xl border border-neutral-800/80 bg-neutral-900 p-4 shadow-xl">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-t from-black via-neutral-900 to-neutral-800 p-4 flex flex-col justify-between border border-neutral-800">
              <div className="self-start rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Featured
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary font-bold">
                  Exclusive Stream
                </div>
                <h3 className="font-bricolage text-base font-bold text-white leading-snug mt-1">
                  Architecture & Design 2026
                </h3>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                  <Clock className="h-3 w-3" /> 45 Menit &bull; Full HD
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Security Badge */}
          <div className="w-56 sm:w-64 rounded-3xl border border-neutral-800/80 bg-neutral-900/90 p-4 shadow-xl">
            <div className="flex items-center gap-2 text-primary text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" /> End-to-End Encrypted
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              Proteksi token sesi & pemutaran Range 206 aman.
            </p>
          </div>
        </div>

        {/* Column 3 */}
        <div className="hidden xl:flex flex-col gap-4 animate-in fade-in duration-1000">
          {/* Card 7 */}
          <div className="w-56 sm:w-64 rounded-3xl border border-neutral-800/80 bg-neutral-900/90 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-white">Koleksi Terpopuler</span>
              <span className="text-[10px] font-mono text-primary">#1 Trending</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-neutral-800/60 p-2 text-xs">
                <span className="text-neutral-200 truncate">Intro to Drizzle ORM</span>
                <span className="text-[10px] text-neutral-400 font-mono">18m</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-800/60 p-2 text-xs">
                <span className="text-neutral-200 truncate">Better-Auth Deep Dive</span>
                <span className="text-[10px] text-neutral-400 font-mono">34m</span>
              </div>
            </div>
          </div>

          {/* Card 8 */}
          <div className="w-56 sm:w-64 rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-900 to-[#120e20] p-4 shadow-xl">
            <div className="h-28 rounded-2xl bg-neutral-800/70 border border-neutral-700/50 flex flex-col items-center justify-center p-3 text-center">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-1">
                <Play className="h-4 w-4 fill-primary ml-0.5" />
              </div>
              <span className="text-xs font-bold text-white">Stream Anywhere</span>
              <span className="text-[10px] text-neutral-400">Mobile, Tablet, Desktop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
