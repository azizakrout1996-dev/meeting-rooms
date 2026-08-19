-- Meeting Rooms - reset & rebuild
-- Paste this ENTIRE file into the Supabase SQL Editor and click Run once.
-- Safe to run even if some of these objects don't exist yet.

-- 1) Clean up anything left over from an earlier attempt (old RLS policies,
--    the old Supabase-Auth-based "profiles" table, etc.)
drop table if exists public.bookings cascade;
drop table if exists public.rooms cascade;
drop table if exists public.floors cascade;
drop table if exists public.profiles cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();

-- 2) Rebuild the schema this app actually uses (no Supabase Auth, no RLS --
--    access is gated by the app's own PIN screen + a server-only service
--    role key; see src/lib/pin.ts and src/lib/supabase/server.ts).
create extension if not exists "pgcrypto";

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.floors (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  booked_by text not null,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);

create index bookings_room_time_idx on public.bookings (room_id, start_time, end_time);
create index rooms_floor_idx on public.rooms (floor_id);

-- 3) Seed 3 floors with 3 / 2 / 1 rooms (rename freely later from /admin).
do $$
declare
  f1 uuid;
  f2 uuid;
  f3 uuid;
begin
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
end $$;
