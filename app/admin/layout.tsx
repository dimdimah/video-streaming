import { requireRole } from "@/lib/auth"
import { AdminNav } from "@/components/admin-nav"

/** Guard role admin untuk seluruh rute /admin/* (route-level). */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("admin")

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 border-b border-border/60 pb-5">
        <h1 className="mb-4 font-bricolage text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Panel Admin
        </h1>
        <AdminNav />
      </div>
      {children}
    </div>
  )
}
