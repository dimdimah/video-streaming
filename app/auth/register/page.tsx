"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(event.currentTarget)

    try {
      const res = await authClient.signUp.email({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        name: formData.get("name") as string,
      })
      if (res.error) {
        setError(res.error.message || "Gagal mendaftar. Coba lagi.")
        return
      }
      router.push(callbackUrl ?? "/videos")
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mendaftar. Coba lagi."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Icon Logo at Top (Mobbin style) */}
      <div className="flex justify-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <span className="font-bricolage font-black text-xl text-primary">VS</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center mb-8">
        <h1 className="font-bricolage text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Create an account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-400">
          Daftar akun baru untuk mulai menonton dan meminta akses video
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-xs text-destructive text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label htmlFor="name" className="sr-only">
            Nama Lengkap
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Full name"
            className="rounded-full h-12 px-5 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white transition-all shadow-none"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            className="rounded-full h-12 px-5 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white transition-all shadow-none"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Kata Sandi
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            className="rounded-full h-12 px-5 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white transition-all shadow-none"
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full h-12 bg-white text-black font-semibold text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all shadow-md"
          >
            {loading ? "Memproses..." : "Create account"}
          </Button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-400">
          Sudah punya akun?{" "}
          <Link
            href={
              callbackUrl
                ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/auth/login"
            }
            className="text-white font-medium hover:underline underline-offset-4"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sm text-neutral-500">Memuat form...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
