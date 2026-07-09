-- School Cup 2026 — one-shot female standings recompute
-- Recomputes the Female group's standings rows from currently-finished female
-- group-stage matches (using score_a/score_b snapshots) and UPDATEs them in
-- place. Run once in the Supabase SQL editor after applying schema + policies
-- + resync. Mirrors src/lib/supabase.ts recomputeStandingsForGroup("Female").
-- Idempotent: safe to re-run as more female matches finish.

begin;

with finished as (
  select team_a, team_b, score_a, score_b
  from public.matches
  where "group" = 'Female' and status = 'finished'
),
per_team as (
  select team_id,
         sum(p) as p,
         sum(w) as w,
         sum(d) as d,
         sum(l) as l,
         sum(gf) as gf,
         sum(ga) as ga
  from (
    select team_a as team_id, 1 as p,
           (case when score_a > score_b then 1 else 0 end) as w,
           (case when score_a = score_b then 1 else 0 end) as d,
           (case when score_a < score_b then 1 else 0 end) as l,
           score_a as gf, score_b as ga
    from finished
    union all
    select team_b as team_id, 1 as p,
           (case when score_b > score_a then 1 else 0 end) as w,
           (case when score_b = score_a then 1 else 0 end) as d,
           (case when score_b < score_a then 1 else 0 end) as l,
           score_b as gf, score_a as ga
    from finished
  ) t
  group by team_id
),
female_teams as (
  select id as team_id from public.teams where "group" = 'Female'
)
update public.standings s
set p = coalesce(pt.p, 0),
    w = coalesce(pt.w, 0),
    d = coalesce(pt.d, 0),
    l = coalesce(pt.l, 0),
    gf = coalesce(pt.gf, 0),
    ga = coalesce(pt.ga, 0),
    gd = coalesce(pt.gf, 0) - coalesce(pt.ga, 0),
    pts = coalesce(pt.w, 0) * 3 + coalesce(pt.d, 0)
from female_teams ft
left join per_team pt on pt.team_id = ft.team_id
where s.team_id = ft.team_id;

commit;

-- Verify (as of matches 3, 6, 9, 12, 15 finished):
--   EcE_F  P2 W1 D1 L0 GF2 GA0 GD2  PTS4
--   IS_F   P2 W0 D2 L0 GF0 GA0 GD0  PTS2
--   CE_F   P2 W0 D2 L0 GF0 GA0 GD0  PTS2
--   PrE_F  P2 W0 D2 L0 GF0 GA0 GD0  PTS2
--   AME_F  P2 W0 D1 L1 GF0 GA2 GD-2 PTS1
-- select s.team_id, s.p, s.w, s.d, s.l, s.gf, s.ga, s.gd, s.pts
-- from public.standings s
-- join public.teams t on t.id = s.team_id
-- where t."group" = 'Female'
-- order by s.pts desc, s.gd desc, s.gf desc;
