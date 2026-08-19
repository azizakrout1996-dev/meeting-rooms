-- Meeting Room Booking App - initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
--
-- This app does NOT use Supabase Auth. Access is gated by a shared PIN inside
-- the Next.js app itself (see src/lib/pin.ts), and all database access from
-- the server uses the Supabase *service role* key, which bypasses Row Level
-- Security entirely. RLS is therefore left off on purpose here -- the real
-- access control boundary is the PIN screen + server-only service role key,
-- not Postgres RLS. Never expose the service role key to the browser.

create extension if not exists "pgcrypto";

create table if not exists public.floors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.floors (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  booked_by text not null,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);

create index if not exists bookings_room_time_idx on public.bookings (room_id, start_time, end_time);
create index if not exists rooms_floor_idx on public.rooms (floor_id);

-- ============================================================================
-- Seed data: 3 floors with 3 / 2 / 1 rooms (rename freely from the admin
-- panel afterwards).
-- ============================================================================
do $$
declare
  f1 uuid;
  f2 uuid;
  f3 uuid;
begin
  if not exists (select 1 from public.floors) then
    insert into public.floors (name, position) values ('Floor 1', 1) returning id into f1;
    insert into public.floors (name, position) values ('Floor 2', 2) returning id into f2;
    insert into public.floors (name, position) values ('Floor 3', 3) returning id into f3;

    insert into public.rooms (floor_id, name, position) values
      (f1, 'Room 1', 1),
      (f1, 'Room 2', 2),
      (f1, 'Room 3', 3),
      (f2, 'Room 1', 1),
      (f2, 'Room 2', 2),
      (f3, 'Room 1', 1);
  end if;
end $$;
