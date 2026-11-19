const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

/** Terima Date (server) atau string ISO (hasil serialisasi ke client). */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "-"
  return dateFormatter.format(date)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
