import { NextResponse } from "next/server"
import { auth, getApiUser } from "@/lib/auth"

/**
 * Buat data customer baru (oleh admin). Password di-hash oleh better-auth
 * lewat alur sign-up yang sama dengan registrasi mandiri; role selalu
 * "customer" karena additionalFields.role ber-`input: false`.
 */
export async function POST(request: Request) {
  const admin = await getApiUser()
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string
    email?: string
    password?: string
  } | null

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 })
  }

  try {
    const created = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: new Headers({ origin: process.env.BETTER_AUTH_URL ?? "http://localhost:3000" }),
    })
    return NextResponse.json({ user: created.user }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat customer"
    const status = /already|exist|unique/i.test(message) ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
