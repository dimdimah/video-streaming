import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { hashPassword } from "better-auth/crypto"
import { getApiUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { account, user } from "@/lib/schema"

type Params = { params: Promise<{ id: string }> }

async function findCustomer(id: string) {
  const rows = await db
    .select()
    .from(user)
    .where(and(eq(user.id, id), eq(user.role, "customer")))
    .limit(1)
  return rows[0] ?? null
}

/** Update data customer (nama/email; password hanya bila diisi). */
export async function PUT(request: Request, { params }: Params) {
  const admin = await getApiUser()
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const existing = await findCustomer(id)
  if (!existing) return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 })

  const body = (await request.json().catch(() => null)) as {
    name?: string
    email?: string
    password?: string
  } | null

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  if (!name || !email) {
    return NextResponse.json({ error: "Nama dan email wajib diisi" }, { status: 400 })
  }

  try {
    await db
      .update(user)
      .set({ name, email, updatedAt: new Date() })
      .where(eq(user.id, id))
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal update"
    if (/unique|constraint/i.test(message)) {
      return NextResponse.json({ error: "Email sudah dipakai" }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (body?.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 })
    }
    const hashed = await hashPassword(body.password)
    await db
      .update(account)
      .set({ password: hashed, updatedAt: new Date() })
      .where(and(eq(account.userId, id), eq(account.providerId, "credential")))
  }

  return NextResponse.json({ ok: true })
}

/** Hapus customer. Sesinya ikut terhapus (FK cascade ON). */
export async function DELETE(_request: Request, { params }: Params) {
  const admin = await getApiUser()
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  if (id === admin.id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 })
  }

  const existing = await findCustomer(id)
  if (!existing) return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 })

  await db.delete(user).where(eq(user.id, id))
  return NextResponse.json({ ok: true })
}
