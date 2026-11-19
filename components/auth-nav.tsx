"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AuthNav() {
  const router = useRouter()
  const [session, setSession] = useState<{ user: { id: string; name: string; role: string } } | null>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    let mounted = true

    // Ambil sesi setelah mount (render awal netral → tidak ada mismatch hidrasi).
    fetch("/api/auth/get-session", {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json()
        // better-auth get-session mengembalikan { session, user } (user tidak
        // nested di session). Bentuk lama data.session.user membuat
        // "Cannot read properties of undefined (reading 'role')".
        if (!data?.session || !data?.user) return null
        return { user: data.user as { id: string; name: string; role: string } }
      })
      .then((s) => {
        if (mounted) {
          setSession(s ?? null)
          setIsPending(false)
        }
      })
      .catch(() => {
        if (mounted) setIsPending(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  // Selama pending, tampilkan netral (hanya tautan masuk/daftar) agar HTML
  // server dan render klien awal identik → tidak ada error hidrasi.
  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login" className="text-sm font-medium">
          Masuk
        </Link>
        <Link href="/auth/register" className="text-sm font-medium underline underline-offset-4">
          Daftar
        </Link>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {session.user.role === "admin" ? (
          <Link href="/admin" className="text-sm font-medium hover:text-foreground">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/videos" className="text-sm font-medium hover:text-foreground">
              Video
            </Link>
            <Link href="/requests" className="text-sm font-medium hover:text-foreground">
              Permintaan
            </Link>
          </>
        )}
        <span className="text-sm text-muted-foreground">
          {session.user.name} &middot; <span className="font-semibold capitalize">{session.user.role}</span>
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Keluar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth/login" className="text-sm font-medium">
        Masuk
      </Link>
      <Link href="/auth/register" className="text-sm font-medium underline underline-offset-4">
        Daftar
      </Link>
    </div>
  )
}
