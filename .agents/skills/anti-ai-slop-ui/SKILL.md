---
name: anti-ai-slop-ui
description: Menjamin standar desain UI/UX berkelas (high craft, human-centric) dan mengeliminasi "AI slop" (gradien pelangi klise, padding raksasa tanpa isi, buzzword hambar, template generik v0). Gunakan setiap kali membuat atau memodifikasi komponen, layout, atau halaman UI.
---

# Anti-AI-Slop UI/UX Design Guide (Standard: yapp.ink & High-Craft Web)

Panduan ini mencegah agen menghasilkan antarmuka murahan/generik ("AI Slop") dan memastikan setiap halaman memiliki karakter kuat, fungsional, dan memiliki rasa seni seperti produk berkelas (yapp.ink, Linear, Raycast).

---

## 1. 🚫 Blacklist "AI Slop" (Dilarang Keras)

Hindari kebiasaan buruk yang sering dihasilkan AI generik:
1. **Gradien Pelangi Acak (Cyan-to-Purple Cliché):**
   - JANGAN gunakan teks gradien atau background gradien di setiap judul/elemen tanpa hirarki.
   - Gradien hanya diizinkan untuk aksen sangat terbatas (misal: 1 border pill badge di hero).
2. **Buzzword Marketing Kosong:**
   - JANGAN tulis teks seperti *"Empower your digital journey"*, *"Revolutionize your seamless workflow"*, *"Unlock the future of streaming"*.
   - Gunakan micro-copy yang membumi, faktual, dan menjelaskan fungsi nyata dalam Bahasa Indonesia yang wajar.
3. **Kartu Hampa & Padding Raksasa (Low Information Density):**
   - JANGAN buat kartu besar dengan padding `p-12` yang isinya hanya 1 ikon dan 1 kalimat umum.
   - Setiap kartu harus padat informasi berguna: status badge, metadata tanggal/jam, ukuran byte, aksi jelas.
4. **Animasi Berlebihan (Over-animated Bloat):**
   - JANGAN pasang kursor melayang palsu, partikel mengapung, atau efek bounce yang tidak memberi nilai fungsi.
   - Animasi hanya untuk feedback taktil nyata: `active:scale-[0.98]`, transisi hover warna `duration-150`, focus ring.
5. **Glassmorphism & Drop Shadow Kotor:**
   - JANGAN gunakan `backdrop-blur` tebal dengan shadow hitam pekat di semua elemen.
   - Gunakan border halus `border-border/80` (`#e5e5e5`) dan shadow mikro (`shadow-xs` / `shadow-sm`).

---

## 2. ✨ Pilar High-Craft Design (Karakter yapp.ink)

### A. Tipografi Berkarakter (Typographic Voice)
- **Headings (Display):** Gunakan `Bricolage Grotesque` (`font-bricolage` / `var(--font-bricolage)`). Font ini memiliki geometri unik dan ink-traps tebal yang memberikan identitas kuat dan hangat.
- **Body & Controls:** Gunakan `Work Sans` (`font-sans` / `var(--font-work-sans)`). Sangat tajam, proporsional, dan nyaman dibaca pada ukuran 12px–15px.
- **Metadata Teknis:** Gunakan `Geist Mono` (`font-mono`) untuk ukuran file, timestamp, durasi, dan ID.

### B. Aturan Warna 90-10 (Color Restraint)
- **90% Monokrom Bersih:**
  - Background: `#ffffff` (light) / `#09090b` (dark)
  - Teks: `#252525` (primer) / `#4a4a4a` (sekunder)
  - Border: `#e5e5e5` (`border-border`)
- **10% Warna Aksen Tunggal:**
  - Primary: `#582af0` (ungu pekat khas Yapp)
  - Tint lembut: `#f8f6ff` (background tombol sekunder atau badge aktif)
  - Status fungsional terbatas: Hijau Emerald untuk aktif, Kuning Amber untuk pending, Merah untuk destructive.

### C. Disiplin Bentuk Geometri (Rhythm & Radii)
- **Kapsul Penuh (`rounded-full`):**
  - Wajib untuk semua elemen interaktif: Button, Input, Select dropdown, Badge, Tab navigasi, Floating header navbar.
- **Lekukan Ramah (`rounded-3xl` / `rounded-2xl`):**
  - Untuk container utama: Kartu video, container form input, modal, dan frame player.
- **Micro-interactions:**
  - Tombol harus memiliki feedback klik: `active:scale-[0.98]` atau `active:translate-y-px`.
  - Fokus keyboard harus tegas: `focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20`.

### D. Struktur Halaman & Navigasi
- Gunakan **Floating Capsule Navbar** (`fixed top-5 rounded-full border bg-background/70 backdrop-blur-md`).
- Tambahkan atmosfer halus di balik hero: `radial-gradient(ellipse 70% 60% at 50% 0%, rgba(88,42,240,0.14), transparent)`.

---

## 3. Checklist Sebelum Selesai Coding UI

Sebelum mengakhiri turn saat membuat UI baru:
- [ ] Apakah font judul menggunakan `font-bricolage` dan body `font-sans`?
- [ ] Apakah tombol dan input menggunakan `rounded-full`?
- [ ] Apakah warna aksen konsisten di ungu `#582af0` / `#f8f6ff` tanpa gradien pelangi liar?
- [ ] Apakah teksnya manusiawi, to the point, dan tidak ada kalimat marketing klise?
- [ ] Apakah kartu menyajikan data padat (metadata, badge status, tombol aksi)?
- [ ] Apakah mode gelap (`dark:`) terlihat kontras dan nyaman?
