import { randomBytes } from "node:crypto"
import { writeFileSync, unlinkSync, mkdirSync } from "node:fs"
import Database from "better-sqlite3"

mkdirSync("./storage", { recursive: true })

const BASE = "http://localhost:3000"
const AUTH = BASE + "/api/auth"
const ORIGIN = BASE
const ADMIN_EMAIL = "admin1794995497551@example.com"
const ADMIN_PW = "password123"
const CUSTOMER_EMAIL = `smoke-${Date.now()}@example.com`
const CUSTOMER_PW = "password123"

const results = []
function check(name, cond, extra = "") {
  results.push({ name, ok: !!cond, extra })
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  [" + extra + "]" : ""}`)
}

async function json(res) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { _text: text } }
}

async function login(email, password) {
  const r = await fetch(AUTH + "/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
    body: JSON.stringify({ email, password }),
  })
  if (r.status !== 200) throw new Error(`login ${email} -> ${r.status}`)
  const cookies = r.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ")
  return cookies
}

async function main() {
  // 1. Login admin
  const adminCookie = await login(ADMIN_EMAIL, ADMIN_PW)
  check("login admin", adminCookie.includes("better-auth.session_token"))

  // 2. Admin membuat customer
  let r = await fetch(BASE + "/api/admin/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ name: "Customer Smoke", email: CUSTOMER_EMAIL, password: CUSTOMER_PW }),
  })
  let b = await json(r)
  check("admin buat customer", r.status === 201, `status=${r.status} ${b.error ?? ""}`)
  const customerId = b.user?.id

  // Customer role harus "customer"
  const db = new Database("./local.db")
  const cust = db.prepare(`SELECT role FROM "user" WHERE id = ?`).get(customerId)
  check("role customer = 'customer'", cust?.role === "customer", `role=${cust?.role}`)

  // 3. Admin upload video (file .mp4 dummy)
  const tmpFile = `./storage/smoke-${Date.now()}.mp4`
  writeFileSync(tmpFile, randomBytes(64 * 1024))
  const form = new FormData()
  form.set("title", "Video Smoke Test")
  form.set("description", "untuk smoke test")
  form.set("file", new Blob([await import("node:fs").then((fs) => fs.readFileSync(tmpFile))], { type: "video/mp4" }), "smoke.mp4")
  r = await fetch(BASE + "/api/admin/videos", {
    method: "POST",
    headers: { Cookie: adminCookie },
    body: form,
  })
  b = await json(r)
  check("admin upload video", r.status === 201, `status=${r.status} ${b.error ?? ""}`)
  const videoId = b.id

  // Upload non-MP4 harus ditolak
  const badForm = new FormData()
  badForm.set("title", "jelek")
  badForm.set("file", new Blob([Buffer.from("x")], { type: "video/x-msvideo" }), "smoke.avi")
  r = await fetch(BASE + "/api/admin/videos", {
    method: "POST",
    headers: { Cookie: adminCookie },
    body: badForm,
  })
  check("upload .avi ditolak", r.status === 400, `status=${r.status}`)

  // 4. Customer login + minta akses
  const custCookie = await login(CUSTOMER_EMAIL, CUSTOMER_PW)
  r = await fetch(BASE + "/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: custCookie },
    body: JSON.stringify({ videoId }),
  })
  check("customer minta akses", r.status === 201, `status=${r.status}`)

  // Duplikat pending harus 409
  r = await fetch(BASE + "/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: custCookie },
    body: JSON.stringify({ videoId }),
  })
  check("permintaan duplikat ditolak (409)", r.status === 409, `status=${r.status}`)

  // 5. Play SEBELUM approve → 403
  r = await fetch(`${BASE}/api/videos/${videoId}/play`, { headers: { Cookie: custCookie } })
  check("play sebelum approve = 403", r.status === 403, `status=${r.status}`)

  // 6. Admin approve 1 jam
  const req = db
    .prepare(`SELECT id FROM video_access WHERE videoId = ? AND userId = ? AND status = 'pending'`)
    .get(videoId, customerId)
  r = await fetch(`${BASE}/api/requests/${req.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ action: "approve", hours: 1 }),
  })
  b = await json(r)
  check("admin approve 1 jam", r.status === 200 && !!b.expiresAt, `status=${r.status} ${b.error ?? ""}`)

  // 7. Play setelah approve → 200 + Range → 206
  r = await fetch(`${BASE}/api/videos/${videoId}/play`, { headers: { Cookie: custCookie } })
  const buf = r.arrayBuffer ? await r.arrayBuffer() : null
  check("play setelah approve = 200", r.status === 200 && r.headers.get("accept-ranges") === "bytes", `status=${r.status}`)
  check("body video terkirim", buf && buf.byteLength === 64 * 1024, `bytes=${buf?.byteLength}`)

  r = await fetch(`${BASE}/api/videos/${videoId}/play`, {
    headers: { Cookie: custCookie, Range: "bytes=0-1023" },
  })
  const part = await r.arrayBuffer()
  check("Range request = 206 (1024 byte)", r.status === 206 && part.byteLength === 1024, `status=${r.status} bytes=${part.byteLength}`)

  // 8. Tanpa sesi → 401
  r = await fetch(`${BASE}/api/videos/${videoId}/play`)
  check("play tanpa sesi = 401", r.status === 401, `status=${r.status}`)

  // 9. Expire-kan akses → play 403 (kolom drizzle mode timestamp = unix detik)
  db.prepare(`UPDATE video_access SET expiresAt = ? WHERE videoId = ? AND userId = ?`)
    .run(Math.floor(Date.now() / 1000) - 60, videoId, customerId)
  r = await fetch(`${BASE}/api/videos/${videoId}/play`, { headers: { Cookie: custCookie } })
  check("play setelah kedaluwarsa = 403", r.status === 403, `status=${r.status}`)

  // 10. Customer minta ulang → 201
  r = await fetch(BASE + "/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: custCookie },
    body: JSON.stringify({ videoId }),
  })
  check("minta akses ulang setelah habis", r.status === 201, `status=${r.status}`)

  // 11. Admin deny permintaan kedua
  const req2 = db
    .prepare(`SELECT id FROM video_access WHERE videoId = ? AND userId = ? AND status = 'pending'`)
    .get(videoId, customerId)
  r = await fetch(`${BASE}/api/requests/${req2.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ action: "deny" }),
  })
  check("admin deny", r.status === 200, `status=${r.status}`)

  // 12. Guard halaman
  r = await fetch(BASE + "/admin", { headers: { Cookie: custCookie }, redirect: "manual" })
  check("customer buka /admin → redirect", r.status >= 300 && r.status < 400, `status=${r.status}`)
  r = await fetch(BASE + "/admin/customers", { headers: { Cookie: adminCookie }, redirect: "manual" })
  const adminPage = r.status === 200 ? await r.text() : ""
  check("admin buka /admin/customers = 200", r.status === 200 && adminPage.includes("Customer Smoke"), `status=${r.status}`)
  r = await fetch(BASE + "/videos", { headers: { Cookie: custCookie } })
  const videosPage = r.status === 200 ? await r.text() : ""
  check("customer buka /videos = 200 + ada judul", r.status === 200 && videosPage.includes("Video Smoke Test"), `status=${r.status}`)
  r = await fetch(BASE + "/requests", { headers: { Cookie: custCookie } })
  const reqPage = r.status === 200 ? await r.text() : ""
  check("customer buka /requests = 200 + riwayat", r.status === 200 && reqPage.includes("Video Smoke Test"), `status=${r.status}`)
  r = await fetch(BASE + "/videos", { redirect: "manual" })
  check("/videos tanpa sesi → redirect", r.status >= 300 && r.status < 400, `status=${r.status}`)

  // 13. Customer lain tanpa izin → 403
  const otherEmail = `smoke2-${Date.now()}@example.com`
  await fetch(BASE + "/api/admin/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ name: "Orang Lain", email: otherEmail, password: CUSTOMER_PW }),
  })
  const otherCookie = await login(otherEmail, CUSTOMER_PW)
  r = await fetch(`${BASE}/api/videos/${videoId}/play`, { headers: { Cookie: otherCookie } })
  check("customer lain play = 403", r.status === 403, `status=${r.status}`)

  // 14. Customer buka /admin → redirect (role guard server)
  r = await fetch(BASE + "/admin", { headers: { Cookie: custCookie }, redirect: "manual" })
  const loc = r.headers.get("location") ?? ""
  check("customer /admin → redirect ke /", r.status >= 300 && r.status < 400, `status=${r.status} loc=${loc}`)

  // 15. Hapus video oleh admin → file ikut hilang
  const row = db.prepare(`SELECT filePath FROM video WHERE id = ?`).get(videoId)
  r = await fetch(`${BASE}/api/admin/videos/${videoId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  })
  const fs = await import("node:fs")
  const fileGone = row && !fs.existsSync(row.filePath)
  check("hapus video + file", r.status === 200 && fileGone, `status=${r.status} fileGone=${fileGone}`)

  db.close()
  try { unlinkSync(tmpFile) } catch {}

  const failed = results.filter((x) => !x.ok)
  console.log(`\n=== ${results.length - failed.length}/${results.length} PASS ===`)
  if (failed.length) process.exit(1)
}

main().catch((e) => {
  console.error("ERR", e)
  process.exit(1)
})
