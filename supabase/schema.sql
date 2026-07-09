-- School Cup 2026 — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- This is the post-migration source of truth for the tables backing the
-- public app and the fifaOwner admin panel.

-- enable the pgcrypto extension so gen_random_uuid() is available
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- teams — metadata, seeded from src/data/tournament.ts (TEAMS). Read-only.
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id     text primary key,
  name   text not null,
  "group"  text not null,
  gender text not null,
  logo   text,
  color  text
);

-- ---------------------------------------------------------------------------
-- matches — one row per scheduled/played match.
-- status: 'scheduled' | 'live' | 'finished'.  score_a/score_b are the final
-- snapshot written on Finish Match; while a match is live, the public/admin
-- UI derives the score from goal_events (count per team_id).
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id        text primary key,
  date      date not null,
  time      text not null,
  team_a    text not null,
  team_b    text not null,
  logo_a    text,
  logo_b    text,
  "group"     text not null,
  gender    text not null,
  status    text not null default 'scheduled',
  score_a   integer,
  score_b   integer,
  penalty_a integer,
  penalty_b integer,
  disbanded boolean not null default false
);

-- penalty_a / penalty_b are only set for drawn knockout matches (Semi-final /
-- Final / Bronze Final) that went to a shootout. Null otherwise. The winner of
-- the shootout is derived by comparing these on a finished, drawn knockout row.
alter table public.matches add column if not exists penalty_a integer;
alter table public.matches add column if not exists penalty_b integer;

-- ---------------------------------------------------------------------------
-- goal_events — append-only log of who scored.  Each row is exactly one goal.
-- Undo = DELETE of the exact row by id.  Scores are derived from this log.
-- ---------------------------------------------------------------------------
create table if not exists public.goal_events (
  id            uuid primary key default gen_random_uuid(),
  match_id      text not null,
  team_id       text not null,
  player_id     text not null,
  player_number text,
  player_name   text,
  created_at    timestamptz not null default now()
);

create index if not exists goal_events_match_id_idx
  on public.goal_events (match_id);
create index if not exists goal_events_match_team_idx
  on public.goal_events (match_id, team_id);
create index if not exists goal_events_player_idx
  on public.goal_events (player_id);

-- ---------------------------------------------------------------------------
-- standings — group-stage standings snapshot, seeded from STANDINGS.
-- Read-only during this tournament (knockout matches do not affect groups).
-- ---------------------------------------------------------------------------
create table if not exists public.standings (
  team_id text primary key,
  p       integer not null default 0,
  w       integer not null default 0,
  d       integer not null default 0,
  l       integer not null default 0,
  gf      integer not null default 0,
  ga      integer not null default 0,
  gd      integer not null default 0,
  pts     integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.teams       enable row level security;
alter table public.matches     enable row level security;
alter table public.goal_events enable row level security;
alter table public.standings   enable row level security;

-- ---------------------------------------------------------------------------
-- Realtime: add tables to the supabase_realtime publication so the client
-- postgres_changes subscriptions on matches / goal_events / standings fire.
-- (teams is metadata and not subscribed to, but harmless to include.)
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.teams;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.matches;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.goal_events;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.standings;
  exception when duplicate_object then null;
  end;
end $$;