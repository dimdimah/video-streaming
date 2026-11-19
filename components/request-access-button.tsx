"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { AccessStatus } from "@/lib/access"

/**
 * Tombol permintaan akses menonton (customer).
 * - none/denied: "Minta Akses"; expired: "Minta Akses Ulang"; pending: teks status.
 */
export function RequestAccessButton({
  videoId,
  status,
}: {
  videoId: string
  status: AccessStatus
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (status === "pending") {
    return (
      <p className="text-sm text-muted-foreground">
        Permintaan sedang menunggu persetujuan admin.
      </p>
    )
  }
  if (status === "active") return null

  async function handleClick() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setError(data?.error ?? "Gagal mengirim permintaan")
        return
      }
      router.refresh()
    } catch {
      setError("Gagal mengirim permintaan")
    } finally {
      setLoading(false)
    }
  }

  const label =
    status === "expired"
      ? "Minta Akses Ulang"
      : status === "denied"
        ? "Ajukan Ulang"
        : "Minta Akses"

  return (
    <div className="flex flex-col gap-1.5">
      <Button className="w-full rounded-full" onClick={handleClick} disabled={loading}>
        {loading ? "Mengirim..." : label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
