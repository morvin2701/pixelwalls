-- Add public and likes fields to user_wallpapers table

-- 1. Ensure user_wallpapers table has necessary columns
alter table public.user_wallpapers 
add column if not exists is_public boolean default false,
add column if not exists likes_count integer default 0,
add column if not exists user_name text, -- cache user name for display
add column if not exists user_avatar text; -- cache user avatar

-- 2. Create likes table for social interaction
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wallpaper_id text not null, -- user_wallpapers uses text/string IDs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, wallpaper_id)
);

-- 3. RLS Policies
alter table public.likes enable row level security;

-- Drop existing policies if they exist to avoid errors on rerun
drop policy if exists "Users can view all likes" on public.likes;
drop policy if exists "Users can toggle their own likes" on public.likes;
drop policy if exists "Users can remove their own likes" on public.likes;

create policy "Users can view all likes"
  on public.likes for select
  using (true);

create policy "Users can toggle their own likes"
  on public.likes for insert
  with check (auth.uid() = user_id); 

create policy "Users can remove their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);
  
-- 4. Policy for public wallpapers
-- Ensure public wallpapers are viewable by everyone

drop policy if exists "Public wallpapers are viewable by everyone" on public.user_wallpapers;

-- CRITICAL FIX: Cast auth.uid() to text because user_wallpapers.user_id is text
create policy "Public wallpapers are viewable by everyone"
  on public.user_wallpapers for select
  using (is_public = true or auth.uid()::text = user_id);
