# CareerDesk CMS (Next.js + TypeScript + Supabase)

## Instalasi baru
1. Buat project di https://supabase.com
2. SQL Editor → jalankan `supabase/schema.sql`
3. Authentication → Users → Add user (email + password). Nonaktifkan "Allow new users to sign up".
4. `cp .env.example .env.local` lalu isi URL & anon key (Project Settings → API)
5. `npm install && npm run dev` → http://localhost:3000

## Memperbarui database lama
Jalankan sesuai kebutuhan di SQL Editor (sekali saja):
- `supabase/migration_002_open_to_work.sql` — kolom status mencari kerja
- `supabase/migration_003_projects.sql` — tabel proyek
- `supabase/migration_004_storage.sql` — bucket upload gambar + kolom gambar sertifikat

## Preview website
- Tombol **Preview Website** di tiap halaman modul membuka pop up berisi tampilan front end terbaru.
- Setelah menyimpan data, klik **Lihat preview** pada notifikasi.
- Versi layar penuh: menu **Preview Website** di sidebar (`/preview`).
