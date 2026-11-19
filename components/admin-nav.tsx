"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/customers", label: "Customer" },
  { href: "/admin/videos", label: "Video" },
  { href: "/admin/requests", label: "Permintaan" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
