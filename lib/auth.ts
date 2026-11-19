import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "./db"
import * as schema from "./schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
    usePlural: false,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
        input: false,
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = Session["user"]
export type Role = "admin" | "customer"

/** Ambil sesi saat ini di sisi server (layout / route handler) dari cookie request. */
export async function getCurrentSession(reqHeaders: Headers) {
  try {
    const data = await auth.api.getSession({ headers: reqHeaders })
    return (data as { session: Session; user: User } | null) ?? null
  } catch {
    return null
  }
}

/** Guard login untuk Server Component: belum sesi → /auth/login. */
export async function requireUser(): Promise<User> {
  const reqHeaders = await headers()
  const session = await getCurrentSession(reqHeaders).catch(() => null)
  if (!session?.user) redirect("/auth/login")
  return session.user
}

/** Guard role untuk Server Component: salah role → /. */
export async function requireRole(role: Role): Promise<User> {
  const user = await requireUser()
  if (user.role !== role) redirect("/")
  return user
}

/** Untuk route handler: ambil user dari cookie; null bila belum login. */
export async function getApiUser(): Promise<User | null> {
  const reqHeaders = await headers()
  const session = await getCurrentSession(reqHeaders).catch(() => null)
  return session?.user ?? null
}
