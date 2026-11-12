-- Jalankan sekali jika database sudah dibuat dengan schema.sql versi sebelumnya
alter table public.profiles add column if not exists open_to_work boolean not null default true;
