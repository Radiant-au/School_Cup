// Generates supabase/seed.sql from the existing curated data in
// src/data/tournament.ts and src/data/squads/*.ts so the migration starts
// from the same dataset the static app shipped with.
//
// Run:  node --experimental-strip-types supabase/generate-seed.mts
// (Node 22+ strips types natively; no extra dependency required.)

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TEAMS, MATCHES, MATCH_EVENTS, STANDINGS } from "../src/data/tournament";
import { SQUADS } from "../src/data/squads";

function sqlStr(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlOpt(value: string | undefined | null): string {
  if (value === undefined || value === null || value === "") return "null";
  return sqlStr(value);
}

function playerView(playerId: string): { name?: string; number?: string } {
  for (const squad of Object.values(SQUADS)) {
    const p = squad.find((pl) => pl.id === playerId);
    if (p) return { name: p.name, number: p.number };
  }
  return {};
}

const lines: string[] = [];
lines.push("-- School Cup 2026 — seed data (generated from src/data/*.ts)");
lines.push("-- Idempotent: safe to re-run. Run AFTER schema.sql + policies.sql.");
lines.push("-- Regenerate with: node --experimental-strip-types supabase/generate-seed.mts");
lines.push("");
lines.push("begin;");
lines.push("");

lines.push("-- teams");
for (const t of TEAMS) {
  lines.push(
    `insert into public.teams (id, name, "group", gender, logo, color) values (${sqlStr(t.id)}, ${sqlStr(t.name)}, ${sqlStr(t.group)}, ${sqlStr(t.gender)}, ${sqlOpt(t.logo)}, ${sqlOpt(t.color)}) on conflict (id) do update set name = excluded.name, "group" = excluded."group", gender = excluded.gender, logo = excluded.logo, color = excluded.color;`,
  );
}
lines.push("");

lines.push("-- matches");
for (const m of MATCHES) {
  const status = m.finished ? "finished" : "scheduled";
  const penA = m.penaltyA === undefined || m.penaltyA === null ? "null" : m.penaltyA;
  const penB = m.penaltyB === undefined || m.penaltyB === null ? "null" : m.penaltyB;
  lines.push(
    `insert into public.matches (id, date, time, team_a, team_b, logo_a, logo_b, "group", gender, status, score_a, score_b, penalty_a, penalty_b, disbanded) values (${sqlStr(m.id)}, ${sqlStr(m.date)}, ${sqlStr(m.time)}, ${sqlStr(m.teamA)}, ${sqlStr(m.teamB)}, ${sqlOpt(m.logoA)}, ${sqlOpt(m.logoB)}, ${sqlStr(m.group)}, ${sqlStr(m.gender)}, ${sqlStr(status)}, ${m.scoreA === null ? "null" : m.scoreA}, ${m.scoreB === null ? "null" : m.scoreB}, ${penA}, ${penB}, ${m.disbanded ? "true" : "false"}) on conflict (id) do update set date = excluded.date, time = excluded.time, team_a = excluded.team_a, team_b = excluded.team_b, logo_a = excluded.logo_a, logo_b = excluded.logo_b, "group" = excluded."group", gender = excluded.gender, status = (case when matches.status = 'live' then 'live' else excluded.status end), score_a = excluded.score_a, score_b = excluded.score_b, penalty_a = excluded.penalty_a, penalty_b = excluded.penalty_b, disbanded = excluded.disbanded;`,
  );
}
lines.push("");

lines.push("-- standings");
for (const s of STANDINGS) {
  lines.push(
    `insert into public.standings (team_id, p, w, d, l, gf, ga, gd, pts) values (${sqlStr(s.teamId)}, ${s.p}, ${s.w}, ${s.d}, ${s.l}, ${s.gf}, ${s.ga}, ${s.gd}, ${s.pts}) on conflict (team_id) do update set p = excluded.p, w = excluded.w, d = excluded.d, l = excluded.l, gf = excluded.gf, ga = excluded.ga, gd = excluded.gd, pts = excluded.pts;`,
  );
}
lines.push("");

lines.push("-- goal_events (historical, derived from MATCH_EVENTS + SQUADS metadata)");
lines.push("-- All seeded events belong to finished matches. Clear that scope first so");
lines.push("-- re-running is idempotent and never clobber admin-recorded live goals.");
lines.push(
  "delete from public.goal_events where match_id in (select id from public.matches where status = 'finished');",
);
for (const e of MATCH_EVENTS) {
  const v = playerView(e.playerId);
  lines.push(
    `insert into public.goal_events (match_id, team_id, player_id, player_number, player_name) values (${sqlStr(e.matchId)}, ${sqlStr(e.teamId)}, ${sqlStr(e.playerId)}, ${sqlOpt(v.number)}, ${sqlOpt(v.name)});`,
  );
}
lines.push("");

lines.push("commit;");

const out = lines.join("\n") + "\n";
const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, "seed.sql"), out);
console.log(
  `Wrote supabase/seed.sql (${lines.length} lines; ${MATCHES.length} matches, ${MATCH_EVENTS.length} goal_events, ${TEAMS.length} teams, ${STANDINGS.length} standings).`,
);