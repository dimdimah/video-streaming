"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { formatDateTime } from "@/lib/format"
import type { AccessStatus } from "@/components/status-badge"

export type RequestRow = {
  id: string
  videoTitle: string
  customerName: string
  status: "pending" | "approved" | "denied"
  requestedAt: string | Date
  decidedAt: string | Date | null
  expiresAt: string | Date | null
}

function badgeStatus(status: RequestRow["status"]): AccessStatus {
  return status === "approved" ? "approved" : status
}

/** Daftar permintaan akses + aksi Setujui (durasi jam) / Tolak (admin). */
export function RequestsManager({ requests }: { requests: RequestRow[] }) {
  const router = useRouter()
  const [hours, setHours] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function decide(id: string, action: "approve" | "deny") {
    const body =
      action === "approve"
        ? { action, hours: Number(hours[id] || 24) }
        : { action }
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setError(data?.error ?? "Gagal memproses")
        return
      }
      router.refresh()
    } catch {
      setError("Gagal menghubungi server")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Diminta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Berlaku s/d</th>
              <th className="px-4 py-3 text-right">Keputusan</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada permintaan akses.
                </td>
              </tr>
            )}
            {requests.map((row) => (
              <tr key={row.id} className="border-b last:border-0 align-middle">
                <td className="px-4 py-3 font-medium">{row.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.videoTitle}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(row.requestedAt)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={badgeStatus(row.status)} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.status === "approved" ? formatDateTime(row.expiresAt) : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.status === "pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <Input
                        aria-label={`Durasi jam untuk ${row.videoTitle}`}
                        type="number"
                        min={1}
                        max={720}
                        className="w-20 text-right"
                        placeholder="24"
                        value={hours[row.id] ?? ""}
                        onChange={(e) => setHours({ ...hours, [row.id]: e.target.value })}
                      />
                      <span className="text-xs text-muted-foreground">jam</span>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => decide(row.id, "approve")}
                      >
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() => decide(row.id, "deny")}
                      >
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {row.decidedAt ? `diputuskan ${formatDateTime(row.decidedAt)}` : "-"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
