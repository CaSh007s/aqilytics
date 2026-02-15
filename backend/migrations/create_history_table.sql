-- Create the search_history table
create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  city text not null,
  aqi_value integer not null,
  aqi_category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_snapshot jsonb not null -- Stores the complete API response for restoration
);

-- Add an index on session_id for faster lookups
create index idx_search_history_session_id on public.search_history(session_id);

-- Add an index on created_at for sorting
create index idx_search_history_created_at on public.search_history(created_at);

-- Optional: RLS policies if you want public access (since we are auth-free for now)
alter table public.search_history enable row level security;

create policy "Enable read access for all users"
on public.search_history for select
using (true);

create policy "Enable insert access for all users"
on public.search_history for insert
with check (true);
