import { count, eq } from "drizzle-orm"
import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import { user as userTable, video, videoAccess } from "@/lib/schema"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const admin = await requireRole("admin")

  const [[customerCount], [videoCount], [pendingCount]] = await Promise.all([
    db.select({ value: count() }).from(userTable).where(eq(userTable.role, "customer")),
    db.select({ value: count() }).from(video),
    db.select({ value: count() }).from(videoAccess).where(eq(videoAccess.status, "pending")),
  ])

  const stats = [
    { label: "Customer", value: customerCount.value, href: "/admin/customers" },
    { label: "Video", value: videoCount.value, href: "/admin/videos" },
    { label: "Permintaan menunggu", value: pendingCount.value, href: "/admin/requests" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Selamat datang, <span className="font-medium text-foreground">{admin.name}</span>.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              {stat.label}
            </div>
            <div className="mt-2 font-bricolage text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-6 text-sm text-muted-foreground shadow-xs leading-relaxed">
        <strong className="text-foreground">Alur Operasional:</strong> Buat akun customer &rarr; Unggah video (File MP4/WebM atau Link YouTube) &rarr; Customer mengajukan permintaan akses &rarr; Admin menyetujui dengan durasi jam &rarr; Customer dapat menonton sampai masa berlaku habis.
      </div>
    </div>
  )
}
