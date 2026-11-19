import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Nama cookie sesi bawaan better-auth.
const SESSION_COOKIE = "better-auth.session_token"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value
  const isAuthRoute = pathname.startsWith("/auth")
  const needsSession =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/videos") ||
    pathname.startsWith("/requests")

  // Sudah login dan buka halaman auth → ke beranda
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Belum ada sesi dan buka halaman terproteksi → ke login.
  // Jaga-router saja; penegakan role (admin vs customer) dilakukan di halaman/route sisi server.
  if (!hasSession && needsSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*))"],
}
