-- Create collections table
create table public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create collection_items table
create table public.collection_items (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid references public.collections(id) on delete cascade not null,
  wallpaper_id text not null, -- Assuming wallpaper ID is text based on existing code, or strict reference if wallpapers table exists
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(collection_id, wallpaper_id)
);

-- RLS Policies
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

create policy "Users can view their own collections"
  on public.collections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own collections"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own collections"
  on public.collections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own collections"
  on public.collections for delete
  using (auth.uid() = user_id);

create policy "Users can view items in their collections"
  on public.collection_items for select
  using (
    exists (
      select 1 from public.collections
      where collections.id = collection_items.collection_id
      and collections.user_id = auth.uid()
    )
  );

create policy "Users can add items to their collections"
  on public.collection_items for insert
  with check (
    exists (
      select 1 from public.collections
      where collections.id = collection_items.collection_id
      and collections.user_id = auth.uid()
    )
  );

create policy "Users can remove items from their collections"
  on public.collection_items for delete
  using (
    exists (
      select 1 from public.collections
      where collections.id = collection_items.collection_id
      and collections.user_id = auth.uid()
    )
  );
