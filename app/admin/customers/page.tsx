import { asc, eq } from "drizzle-orm"
import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import { user as userTable } from "@/lib/schema"
import { CustomersManager } from "@/components/admin/customers-manager"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  await requireRole("admin")

  const customers = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(eq(userTable.role, "customer"))
    .orderBy(asc(userTable.createdAt))

  return <CustomersManager customers={customers} />
}
