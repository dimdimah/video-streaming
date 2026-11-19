<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI/UX Design Standards (Anti-AI-Slop & yapp.ink Craft)

Setiap pembuatan atau pembaruan antarmuka (UI/UX) pada projek ini WAJIB mematuhi standar desain craft (rujukan: `.agents/skills/anti-ai-slop-ui/SKILL.md`):

1. **Dilarang "AI Slop"**:
   - DILARANG menggunakan gradien acak (cyan-to-purple clichés), kursor multiplayer palsu, atau partikel melayang yang tidak fungsional.
   - DILARANG menggunakan teks marketing klise (*"Empower your seamless digital journey"*). Gunakan micro-copy bahasa Indonesia yang faktual, membumi, dan fungsional.
   - DILARANG membuat kartu hampa dengan padding raksasa tanpa informasi padat (*information density*).

2. **Karakter yapp.ink**:
   - **Tipografi**: Judul/headings wajib menggunakan `font-bricolage` (`Bricolage Grotesque`), body text menggunakan `font-sans` (`Work Sans`), dan metadata teknis menggunakan `font-mono`.
   - **Warna**: Basis monokrom bersih 90% (`#ffffff`/`#252525`/`#e5e5e5`), aksen 10% ungu yapp `#582af0` dan tint `#f8f6ff`.
   - **Bentuk (Radii)**: Semua tombol (`button`), input (`input`), badge, dan navigasi WAJIB berbentuk kapsul penuh (`rounded-full`). Kartu container menggunakan `rounded-3xl` / `rounded-2xl`.
   - **Header**: Menggunakan floating capsule navbar (`fixed top-5 rounded-full border bg-background/70 backdrop-blur-md`).
