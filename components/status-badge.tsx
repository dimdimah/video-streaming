import { cn } from "@/lib/utils"

export type AccessStatus = "none" | "pending" | "active" | "expired" | "denied" | "approved"

const LABELS: Record<AccessStatus, string> = {
  none: "Belum minta",
  pending: "Menunggu",
  active: "Aktif",
  approved: "Disetujui",
  expired: "Kedaluwarsa",
  denied: "Ditolak",
}

const STYLES: Record<AccessStatus, string> = {
  none: "border-border bg-muted text-muted-foreground",
  pending: "border-warning/40 bg-warning/10 text-warning",
  active: "border-success/40 bg-success/10 text-success",
  approved: "border-success/40 bg-success/10 text-success",
  expired: "border-border bg-muted text-muted-foreground",
  denied: "border-destructive/40 bg-destructive/10 text-destructive",
}

export function StatusBadge({
  status,
  className,
}: {
  status: AccessStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  )
}
