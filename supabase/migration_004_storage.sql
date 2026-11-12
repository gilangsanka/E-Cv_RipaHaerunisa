-- Jalankan sekali di Supabase > SQL Editor
-- Membuat bucket penyimpanan gambar + aturan akses + kolom gambar sertifikat

alter table public.certifications add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Gambar bisa dilihat publik lewat URL (bucket public).
-- Upload / ubah / hapus hanya boleh di folder milik sendiri: <user_id>/...
drop policy if exists "portfolio read own" on storage.objects;
drop policy if exists "portfolio insert own" on storage.objects;
drop policy if exists "portfolio update own" on storage.objects;
drop policy if exists "portfolio delete own" on storage.objects;

create policy "portfolio read own" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portfolio insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portfolio update own" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portfolio delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
