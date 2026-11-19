"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter()
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
    <div className="w-full text-neutral-900">
      {/* Icon Logo at Top */}
      <div className="flex justify-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-xs">
          <span className="font-bricolage font-black text-xl text-primary">G</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center mb-8">
        <h1 className="font-bricolage text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          Buat Akun Baru
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500">
          Daftar akun baru untuk mulai menonton dan meminta akses video
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive text-center">
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
            placeholder="Nama lengkap"
            className="rounded-full h-12 px-5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-xs"
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
            placeholder="Masukkan alamat email"
            className="rounded-full h-12 px-5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-xs"
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
            placeholder="Buat kata sandi"
            className="rounded-full h-12 px-5 bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-xs"
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full h-12 bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
          >
            {loading ? "Memproses..." : "Daftar Akun"}
          </Button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-500">
          Sudah punya akun?{" "}
          <Link
            href={
              callbackUrl
                ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/auth/login"
            }
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
