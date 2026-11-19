# gatek — Platform Video Streaming dengan Izin Bertempo

Platform streaming video berbasis **Next.js 16 (App Router & Turbopack)** dengan sistem otentikasi **better-auth**, database **SQLite (Drizzle ORM)**, pemutaran video berizin via HTTP Range 206 (MP4/WebM) serta tautan YouTube, ekstraksi thumbnail otomatis, dan antarmuka berstandar craft ala **yapp.ink** (monokrom bersih + aksen ungu `#582af0`).

---

## 🚀 Memulai (One-Command Setup & Run)

Setelah melakukan `git clone`, Anda cukup menjalankan:

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan satu perintah ini untuk setup otomatis & menjalankan aplikasi:
npm run dev
```

### ✨ Apa yang Terjadi Secara Otomatis Saat `npm run dev` Berjalan?
Skrip inisialisasi otomatis (`scripts/bootstrap.ts`) akan mengeksekusi langkah berikut sebelum server menyala:
1. **Otomatis Membuat `.env`**: Jika file `.env` belum ada, file `.env` akan langsung dibuat lengkap dengan random `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=http://localhost:3000`, dan `DATABASE_URL="./local.db"`.
2. **Otomatis Menyiapkan Folder Storage**: Membuat direktori `storage/videos/` dan `storage/thumbnails/` di komputer lokal secara otomatis.
3. **Otomatis Migrasi Database SQLite**: Membuat seluruh tabel (`user`, `session`, `account`, `verification`, `video`, `video_access`) dan index secara aman dan idempoten.
4. **Otomatis Menyediakan Akun Uji Coba**: Mendaftarkan akun admin dan customer default agar Anda bisa langsung mencoba fitur tanpa setup manual.

---

## 🔑 Akun Uji Coba Default

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password123` | Dashboard Admin, Upload Video MP4 & YouTube, Kelola Customer, Persetujuan Akses Tonton |
| **Customer** | `customer@test.com` | `password123` | Jelajah Katalog, Minta Izin Tonton Video, Nonton Streaming Berizin |

---

## 🛠️ Perintah Tersedia

| Perintah | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan bootstrap otomatis (env, storage, db, seed) dan memulai server dev (`http://localhost:3000`) |
| `npm run setup` | Menjalankan bootstrap mandiri tanpa menyalakan server |
| `npm run build` | Memverifikasi bootstrap dan membangun bundle produksi Next.js |
| `npm start` | Menjalankan server produksi |
| `npm run typecheck` | Memvalidasi tipe TypeScript (`tsc --noEmit`) |
| `npm run lint` | Menjalankan linter ESLint |

---

## 📦 Struktur Folder Penting

- `app/` — Halaman Next.js App Router (Landing hero mosaic, `/katalog`, `/auth/*`, `/admin/*`, `/videos/*`, `/requests`).
- `components/` — Komponen UI yapp.ink (Hero ticker, katalog explorer, player, floating navbar).
- `lib/` — Skema database Drizzle, better-auth client/server, helper storage file.
- `storage/` — Folder penyimpanan fisik video MP4 dan thumbnail (otomatis terbuat).
- `scripts/` — Skrip bootstrap otomatis, migrasi database, dan seed.
