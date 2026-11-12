-- Jalankan sekali di Supabase > SQL Editor
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  category text,
  role text,
  year int,
  tech_stack text,          -- dipisahkan koma, contoh: Next.js, TypeScript, Supabase
  description text,
  image_url text,
  demo_url text,
  repo_url text,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;
create policy "own rows" on public.projects for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
