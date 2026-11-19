"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AuthNavProps {
  initialUser?: {
    id: string
    name: string
    role: string
  } | null
}

export function AuthNav({ initialUser = null }: AuthNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: sessionData, isPending } = authClient.useSession()

  // Ambil user dari useSession() react store, fallback ke initialUser dari SSR
  const activeUser =
    (sessionData?.user as unknown as { id: string; name: string; role: string } | undefined) ??
    initialUser

  const [currentUser, setCurrentUser] = useState<typeof activeUser>(activeUser)

  // Sinkronkan currentUser saat sessionData atau initialUser berubah
  useEffect(() => {
    if (sessionData?.user) {
      setCurrentUser(sessionData.user as unknown as { id: string; name: string; role: string })
    } else if (sessionData === null && !isPending) {
      setCurrentUser(null)
    } else if (initialUser) {
      setCurrentUser(initialUser)
    }
  }, [sessionData, isPending, initialUser])

  // Setiap kali URL/pathname berubah (misal redirect setelah login), refresh session client
  useEffect(() => {
    authClient
      .getSession()
      .then((res) => {
        if (res.data?.user) {
          setCurrentUser(res.data.user as unknown as { id: string; name: string; role: string })
        } else if (res.data === null) {
          setCurrentUser(null)
        }
      })
      .catch(() => {})
  }, [pathname])

  async function handleSignOut() {
    await authClient.signOut()
    setCurrentUser(null)
    router.push("/")
    router.refresh()
  }

  // Jika sudah terotentikasi (sebagai admin atau customer)
  if (currentUser) {
    return (
      <div className="flex items-center gap-2.5 sm:gap-3 text-sm">
        <Link
          href="/katalog"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Katalog
        </Link>
        {currentUser.role === "admin" ? (
          <Link
            href="/admin"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/videos"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Video Saya
            </Link>
            <Link
              href="/requests"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Permintaan
            </Link>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="rounded-full h-8 px-3 text-xs border-border/80 hover:bg-neutral-100 transition-all cursor-pointer"
        >
          Keluar
        </Button>
      </div>
    )
  }

  // Jika belum login / tamu
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href="/katalog"
        className="font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Katalog
      </Link>
      <Link
        href="/auth/login"
        className="font-medium text-foreground hover:text-primary transition-colors"
      >
        Masuk
      </Link>
      <Link
        href="/auth/register"
        className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
      >
        Daftar
      </Link>
    </div>
  )
}
