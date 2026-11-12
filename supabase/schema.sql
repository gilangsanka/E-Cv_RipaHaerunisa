-- Jalankan di Supabase Dashboard > SQL Editor

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, headline text, email text, phone text, location text,
  linkedin text, portfolio text, github text, behance text,
  summary text, avatar_url text,
  open_to_work boolean not null default true,
  updated_at timestamptz default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  position text not null, company text not null,
  type text, location text,
  start_date date, end_date date, description text,
  created_at timestamptz default now()
);

create table public.educations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  institution text not null, degree text, field text,
  start_year int, end_year int, gpa text,
  created_at timestamptz default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, category text default 'Hard Skills',
  level int default 50 check (level between 0 and 100),
  created_at timestamptz default now()
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null, issuer text, category text default 'Sertifikasi',
  issued_at date, expires_at date, credential_id text, credential_url text, image_url text,
  created_at timestamptz default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, role text, start_year int, end_year int, description text,
  created_at timestamptz default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null, category text, role text, year int,
  tech_stack text, description text, image_url text, demo_url text, repo_url text,
  created_at timestamptz default now()
);

-- Row Level Security: setiap user hanya bisa akses datanya sendiri
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['experiences','educations','skills','certifications','organizations','projects']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- Otomatis buat profil saat user baru dibuat
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Penyimpanan gambar =====

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
