"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateTime } from "@/lib/format"

export type CustomerRow = {
  id: string
  name: string
  email: string
  createdAt: string | Date
}

type FormState = { name: string; email: string; password: string }

const EMPTY: FormState = { name: "", email: "", password: "" }

/** CRUD customer (dipakai halaman /admin/customers). */
export function CustomersManager({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter()
  const [create, setCreate] = useState<FormState>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState<FormState>(EMPTY)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function request(url: string, method: string, body: unknown) {
    setBusy(true)
    setError("")
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setError(data?.error ?? "Terjadi kesalahan")
        return false
      }
      router.refresh()
      return true
    } catch {
      setError("Gagal menghubungi server")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const ok = await request("/api/admin/customers", "POST", create)
    if (ok) setCreate(EMPTY)
  }

  async function handleSave(id: string) {
    const ok = await request(`/api/admin/customers/${id}`, "PUT", {
      name: edit.name,
      email: edit.email,
      password: edit.password || undefined,
    })
    if (ok) setEditingId(null)
  }

  async function handleDelete(customer: CustomerRow) {
    // shortcut: konfirmasi pakai dialog bawaan browser — cukup untuk admin internal
    if (!window.confirm(`Hapus customer "${customer.name}"?`)) return
    await request(`/api/admin/customers/${customer.id}`, "DELETE", {})
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="mb-4 font-bricolage text-base font-bold">Tambah Customer</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-name">Nama</Label>
            <Input
              id="c-name"
              value={create.name}
              onChange={(e) => setCreate({ ...create, name: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              value={create.email}
              onChange={(e) => setCreate({ ...create, email: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-password">Password</Label>
            <Input
              id="c-password"
              type="password"
              minLength={8}
              value={create.password}
              onChange={(e) => setCreate({ ...create, password: e.target.value })}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={busy} className="rounded-full px-6">
              {busy ? "Menyimpan..." : "Tambah"}
            </Button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Terdaftar</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada customer.
                </td>
              </tr>
            )}
            {customers.map((customer) =>
              editingId === customer.id ? (
                <tr key={customer.id} className="border-b align-top">
                  <td className="px-4 py-3">
                    <Input
                      aria-label="Nama"
                      value={edit.name}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label="Email"
                      type="email"
                      value={edit.email}
                      onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label="Password baru (opsional)"
                      type="password"
                      placeholder="Password baru (opsional)"
                      value={edit.password}
                      onChange={(e) => setEdit({ ...edit, password: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" disabled={busy} onClick={() => handleSave(customer.id)}>
                        Simpan
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Batal
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={customer.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(customer.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(customer.id)
                          setEdit({ name: customer.name, email: customer.email, password: "" })
                        }}
                      >
                        Ubah
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(customer)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
