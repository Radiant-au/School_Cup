export interface Player {
  id: string;
  name: string;
  number: string;
  profile_string_link: string;
}

export interface MatchEvent {
  matchId: string;
  teamId: string;
  playerId: string;
}

export interface Scorer {
  teamId: string;
  playerId: string;
  name: string;
  number: string;
  profile_string_link: string;
  goals: number;
}

export interface StandingEntry {
  teamId: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export interface Team {
  id: string;
  name: string;
  group: "A" | "B" | "Female";
  gender: "Male" | "Female";
  logo?: string;
  color?: string;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  teamA: string;
  teamB: string;
  logoA?: string;
  logoB?: string;
  group: "A" | "B" | "Female" | "Semi-final" | "Final" | "Bronze Final";
  gender: "Male" | "Female";
  scoreA: number | null;
  scoreB: number | null;
  finished: boolean;
  disbanded?: boolean;
  status?: "scheduled" | "live" | "finished";
  penaltyA?: number | null;
  penaltyB?: number | null;
}

export const TEAMS: Team[] = [
  { id: "PrE(A)", name: "PrE(A)", group: "A", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg", color: "#e24938ff" },
  { id: "IS(A)", name: "IS(A)", group: "A", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg", color: "#FFD700" },
  { id: "AME", name: "AME", group: "A", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg", color: "#c7817bff" },
  { id: "EcE(A)", name: "EcE(A)", group: "A", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg", color: "#e6f4ecff" },
  { id: "CE_M", name: "CE", group: "B", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg", color: "#8eccedff" },
  { id: "EcE(B)", name: "EcE(B)", group: "B", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg", color: "#446ddfff" },
  { id: "IS(B)", name: "IS(B)", group: "B", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg", color: "#8B4513" },
  { id: "PrE(B)", name: "PrE(B)", group: "B", gender: "Male", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg", color: "#4ad970ff" },
  { id: "IS_F", name: "IS", group: "Female", gender: "Female", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg", color: "#FFD700" },
  { id: "CE_F", name: "CE", group: "Female", gender: "Female", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg", color: "#8eccedff" },
  { id: "PrE_F", name: "PrE", group: "Female", gender: "Female", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg", color: "#e24938ff" },
  { id: "AME_F", name: "AME", group: "Female", gender: "Female", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg", color: "#9e9493ff" },
  { id: "EcE_F", name: "EcE", group: "Female", gender: "Female", logo: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg", color: "#e6f4ecff" },
];

export const MATCHES: Match[] = [
  // Day 1 — June 29
  {
    id: "1",
    date: "2026-06-29",
    time: "3:00 PM",
    teamA: "PrE(A)",
    teamB: "IS(A)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    group: "A",
    gender: "Male",
    scoreA: 0,
    scoreB: 0,
    finished: true,
  },
  {
    id: "2",
    date: "2026-06-29",
    time: "4:30 PM",
    teamA: "AME",
    teamB: "EcE(A)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "A",
    gender: "Male",
    scoreA: 1,
    scoreB: 2,
    finished: true,
  },
  {
    id: "3",
    date: "2026-06-29",
    time: "6:00 PM",
    teamA: "IS_F",
    teamB: "CE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    group: "Female",
    gender: "Female",
    scoreA: 0,
    scoreB: 0,
    finished: true,
  },
  // Day 2
  {
    id: "4",
    date: "2026-06-30",
    time: "3:00 PM",
    teamA: "CE_M",
    teamB: "EcE(B)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "B",
    gender: "Male",
    scoreA: 3,
    scoreB: 2,
    finished: true,
  },
  {
    id: "5",
    date: "2026-06-30",
    time: "4:30 PM",
    teamA: "IS(B)",
    teamB: "PrE(B)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    group: "B",
    gender: "Male",
    scoreA: 0,
    scoreB: 2,
    finished: true,
  },
  {
    id: "6",
    date: "2026-06-30",
    time: "6:00 PM",
    teamA: "PrE_F",
    teamB: "AME_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    group: "Female",
    gender: "Female",
    scoreA: 0,
    scoreB: 0,
    finished: true,
  },
  // Day 3
  {
    id: "7",
    date: "2026-07-01",
    time: "3:00 PM",
    teamA: "IS(A)",
    teamB: "EcE(A)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "A",
    gender: "Male",
    scoreA: 1,
    scoreB: 0,
    finished: true,
  },
  {
    id: "8",
    date: "2026-07-01",
    time: "4:30 PM",
    teamA: "PrE(A)",
    teamB: "AME",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    group: "A",
    gender: "Male",
    scoreA: 2,
    scoreB: 2,
    finished: true,
  },
  {
    id: "9",
    date: "2026-07-01",
    time: "6:00 PM",
    teamA: "IS_F",
    teamB: "EcE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "Female",
    gender: "Female",
    scoreA: 0,
    scoreB: 0,
    finished: true,
  },
  // Day 4
  {
    id: "10",
    date: "2026-07-02",
    time: "3:00 PM",
    teamA: "EcE(B)",
    teamB: "PrE(B)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    group: "B",
    gender: "Male",
    scoreA: 1,
    scoreB: 1,
    finished: true,
  },
  {
    id: "11",
    date: "2026-07-02",
    time: "4:30 PM",
    teamA: "CE_M",
    teamB: "IS(B)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    group: "B",
    gender: "Male",
    scoreA: 3,
    scoreB: 1,
    finished: true,
  },
  {
    id: "12",
    date: "2026-07-02",
    time: "6:00 PM",
    teamA: "CE_F",
    teamB: "PrE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    group: "Female",
    gender: "Female",
    scoreA: 0,
    scoreB: 0,
    finished: true,
  },
  // Day 5
  {
    id: "13",
    date: "2026-07-03",
    time: "3:00 PM",
    teamA: "PrE(A)",
    teamB: "EcE(A)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "A",
    gender: "Male",
    scoreA: 1,
    scoreB: 0,
    finished: true,
  },
  {
    id: "14",
    date: "2026-07-03",
    time: "4:30 PM",
    teamA: "IS(A)",
    teamB: "AME",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    group: "A",
    gender: "Male",
    scoreA: 0,
    scoreB: 1,
    finished: true,
  },
  {
    id: "15",
    date: "2026-07-03",
    time: "6:00 PM",
    teamA: "AME_F",
    teamB: "EcE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "Female",
    gender: "Female",
    scoreA: 0,
    scoreB: 2,
    finished: true,
  },
  // Day 6
  {
    id: "16",
    date: "2026-07-04",
    time: "3:00 PM",
    teamA: "CE_M",
    teamB: "PrE(B)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    group: "B",
    gender: "Male",
    scoreA: 0,
    scoreB: 1,
    finished: true,
  },
  {
    id: "17",
    date: "2026-07-04",
    time: "4:30 PM",
    teamA: "EcE(B)",
    teamB: "IS(B)",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    group: "B",
    gender: "Male",
    scoreA: 0,
    scoreB: 2,
    finished: true,
  },
  // Day 7
  {
    id: "18",
    date: "2026-07-06",
    time: "4:00 PM",
    teamA: "IS_F",
    teamB: "PrE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    group: "Female",
    gender: "Female",
    scoreA: 0,
    scoreB: 0,
    finished: true,
  },
  {
    id: "19",
    date: "2026-07-06",
    time: "5:00 PM",
    teamA: "CE_F",
    teamB: "AME_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    group: "Female",
    gender: "Female",
    scoreA: 1,
    scoreB: 0,
    finished: true,
  },
  // Day 8
  {
    id: "20",
    date: "2026-07-07",
    time: "3:00 PM",
    teamA: "PrE(A)",
    teamB: "CE_M",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    group: "Semi-final",
    gender: "Male",
    scoreA: 0,
    scoreB: 0,
    finished: true,
    penaltyA: 2,
    penaltyB: 4,
  },
  // Day 9
  {
    id: "21",
    date: "2026-07-08",
    time: "3:00 PM",
    teamA: "PrE(B)",
    teamB: "AME",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    group: "Semi-final",
    gender: "Male",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "22",
    date: "2026-07-08",
    time: "5:00 PM",
    teamA: "PrE_F",
    teamB: "EcE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "Female",
    gender: "Female",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  //Day 10
  {
    id: "23",
    date: "2026-07-10",
    time: "4:00 PM",
    teamA: "AME_F",
    teamB: "IS_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/AME_xb4b3q.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    group: "Female",
    gender: "Female",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "24",
    date: "2026-07-10",
    time: "5:00 PM",
    teamA: "CE_F",
    teamB: "EcE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/EcE_g4mp5f.jpg",
    group: "Female",
    gender: "Female",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  // Day 11 — Finals
  {
    id: "25",
    date: "2026-07-12",
    time: "4:30 PM",
    teamA: "CE_M",
    teamB: "TBD",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/CE_elxpkv.jpg",
    group: "Final",
    gender: "Male",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "26",
    date: "2026-07-12",
    time: "6:00 PM",
    teamA: "TBD",
    teamB: "TBD",
    group: "Final",
    gender: "Female",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
];

export const getTeamName = (id: string) => {
  const team = TEAMS.find((t) => t.id === id);
  return team ? team.name : id;
};

/** @deprecated Pre-migration seed only. The app now reads goal events from the Supabase `goal_events` table via `useGoalEvents`. Used by `supabase/generate-seed.mts` to backfill historical events. */
export const MATCH_EVENTS: MatchEvent[] = [
  { matchId: "2", teamId: "AME", playerId: "AME_03" },
  { matchId: "2", teamId: "EcE(A)", playerId: "EcE_A_03" },
  { matchId: "2", teamId: "EcE(A)", playerId: "EcE_A_03" },
  { matchId: "4", teamId: "CE_M", playerId: "CE_B_03" },
  { matchId: "4", teamId: "CE_M", playerId: "CE_B_15" },
  { matchId: "4", teamId: "CE_M", playerId: "CE_B_01" },
  { matchId: "4", teamId: "EcE(B)", playerId: "EcE_B_07" },
  { matchId: "4", teamId: "EcE(B)", playerId: "EcE_B_13" },
  { matchId: "5", teamId: "PrE(B)", playerId: "PrE_B_10" },
  { matchId: "5", teamId: "PrE(B)", playerId: "PrE_B_10" },
  { matchId: "7", teamId: "IS(A)", playerId: "IS_A_14" },
  { matchId: "8", teamId: "PrE(A)", playerId: "PrE_A_03" },
  { matchId: "8", teamId: "PrE(A)", playerId: "PrE_A_03" },
  { matchId: "8", teamId: "AME", playerId: "AME_03" },
  { matchId: "8", teamId: "AME", playerId: "AME_09" },
  { matchId: "10", teamId: "EcE(B)", playerId: "EcE_B_10" },
  { matchId: "10", teamId: "PrE(B)", playerId: "PrE_B_13" },
  { matchId: "11", teamId: "CE_M", playerId: "CE_B_03" },
  { matchId: "11", teamId: "CE_M", playerId: "CE_B_03" },
  { matchId: "11", teamId: "CE_M", playerId: "CE_B_13" },
  { matchId: "11", teamId: "IS(B)", playerId: "IS_B_10" },
  { matchId: "13", teamId: "PrE(A)", playerId: "PrE_A_09" },
  { matchId: "14", teamId: "AME", playerId: "AME_03" },
  { matchId: "15", teamId: "EcE_F", playerId: "EcE_F_09" },
  { matchId: "15", teamId: "EcE_F", playerId: "EcE_F_06" },
  { matchId: "17", teamId: "IS(B)", playerId: "IS_B_14" },
  { matchId: "17", teamId: "IS(B)", playerId: "IS_B_10" },
  { matchId: "19", teamId: "CE_F", playerId: "CE_F_05" },
];

/** @deprecated Pre-migration seed only. The app now reads standings from the Supabase `standings` table via `useStandings`. */
export const STANDINGS: StandingEntry[] = [
  { teamId: "PrE(A)", p: 3, w: 1, d: 2, l: 0, gf: 3, ga: 2, gd: 1, pts: 5 },
  { teamId: "IS(A)", p: 3, w: 1, d: 1, l: 1, gf: 1, ga: 1, gd: 0, pts: 4 },
  { teamId: "AME", p: 3, w: 1, d: 1, l: 1, gf: 4, ga: 4, gd: 0, pts: 4 },
  { teamId: "EcE(A)", p: 3, w: 1, d: 0, l: 2, gf: 2, ga: 3, gd: -1, pts: 3 },
  { teamId: "IS_F", p: 3, w: 0, d: 3, l: 0, gf: 0, ga: 0, gd: 0, pts: 3 },
  { teamId: "CE_F", p: 3, w: 1, d: 2, l: 0, gf: 1, ga: 0, gd: 1, pts: 5 },
  { teamId: "CE_M", p: 3, w: 2, d: 0, l: 1, gf: 6, ga: 4, gd: 2, pts: 6 },
  { teamId: "EcE(B)", p: 3, w: 0, d: 1, l: 2, gf: 3, ga: 6, gd: -3, pts: 1 },
  { teamId: "IS(B)", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3 },
  { teamId: "PrE(B)", p: 3, w: 2, d: 1, l: 0, gf: 4, ga: 1, gd: 3, pts: 7 },
  { teamId: "PrE_F", p: 3, w: 0, d: 3, l: 0, gf: 0, ga: 0, gd: 0, pts: 3 },
  { teamId: "AME_F", p: 3, w: 0, d: 1, l: 2, gf: 0, ga: 3, gd: -3, pts: 1 },
  { teamId: "EcE_F", p: 2, w: 1, d: 1, l: 0, gf: 2, ga: 0, gd: 2, pts: 4 },
];

export const TOURNAMENT_DATES = Array.from(
  new Set(MATCHES.map((m) => m.date)),
).sort();

/** @deprecated Pre-migration seed only. The app now derives top scorers from the Supabase `goal_events` table via `useTopScorers`. */
export const TOP_SCORERS_MALE: Scorer[] = [
  { teamId: "CE_M", playerId: "CE_B_03", name: "မောင်ဝေဖြိုးအောင်", number: "15", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782931671/WaiPhyoAung_15_iqztoe.jpg", goals: 3 },
  { teamId: "AME", playerId: "AME_03", name: "မောင်ဗညားခန့်အောင်", number: "10", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782933785/BanyarKhantAung_10_yxuaf7.jpg", goals: 3 },
  { teamId: "EcE(A)", playerId: "EcE_A_03", name: "မောင်ဟိန်းထက်နိုင်", number: "66", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782848569/SeinSein_66_priuit.jpg", goals: 2 },
  { teamId: "PrE(B)", playerId: "PrE_B_10", name: "မောင်သန်းထိုက်ဦး", number: "21", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782962136/ThanHtikeOo_21_qy5z7m.jpg", goals: 2 },
  { teamId: "PrE(A)", playerId: "PrE_A_03", name: "မောင်လှိုင်မျိုး", number: "7", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782847244/HlaingMyo_7_b4dl6s.jpg", goals: 2 },
  { teamId: "CE_M", playerId: "CE_B_15", name: "မောင်ဟိန်းမင်းထက်", number: "", profile_string_link: "", goals: 1 },
  { teamId: "CE_M", playerId: "CE_B_01", name: "မောင်အောင်ကောင်းပြည့်", number: "11", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782931665/AungKaungPyae_11_movjhv.jpg  ", goals: 1 },
  { teamId: "EcE(B)", playerId: "EcE_B_07", name: "မောင်ကျော်ကျော်ဝင်း", number: "17", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782925800/KyawKyawWIn_17_xfujhq.jpg", goals: 1 },
  { teamId: "EcE(B)", playerId: "EcE_B_13", name: "မောင်ဟိန်းထက်ဇော်", number: "20", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782925798/HeinHtetZaw_20_ykuc3h.jpg", goals: 1 },
  { teamId: "IS(A)", playerId: "IS_A_14", name: "အာရွန်ရိုလျန်ဆန်း", number: "96", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782934738/AaronRoLiSang_96_qj5g7t.jpg", goals: 1 },
  { teamId: "AME", playerId: "AME_09", name: "မောင်မင်းခန့်ကျော်", number: "7", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782933787/MinKhantKyaw_7_svbu6e.jpg", goals: 1 },
  { teamId: "EcE(B)", playerId: "EcE_B_10", name: "မောင်ဘုန်းမြင့်ဇော်", number: "19", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782925797/BhoneMyintZaw_19_r37aqb.jpg", goals: 1 },
  { teamId: "PrE(B)", playerId: "PrE_B_13", name: "မောင်ထိန်လင်းဖြိုး", number: "49", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782962135/HteinLinPhyo_49_c2ravz.jpg", goals: 1 },
  { teamId: "CE_M", playerId: "CE_B_13", name: "မောင်မျိုးကိုကို", number: "19", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782931670/MyoKoKo_19_onzntp.jpg", goals: 1 },
  { teamId: "IS(B)", playerId: "IS_B_10", name: "ငြိမ်းချမ်းအောင်", number: "67", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782970514/NyeinChanAung_67_qodnua.jpg", goals: 2 },
  { teamId: "IS(B)", playerId: "IS_B_14", name: "ဘုန်းလျှံဆွေ", number: "10", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782970512/MgBhone_10_qj4so4.jpg", goals: 1 },
  { teamId: "PrE(A)", playerId: "PrE_A_09", name: "မောင်ရာဇာဖြိုး", number: "26", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782934434/YarZarPhyo_26_wnre26.jpg", goals: 1 },
];

/** @deprecated Pre-migration seed only. The app now derives top scorers from the Supabase `goal_events` table via `useTopScorers`. */
export const TOP_SCORERS_FEMALE: Scorer[] = [
  { teamId: "EcE_F", playerId: "EcE_F_09", name: "မလချစ်ဒေါင်နော", number: "17", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782934280/LaChitDauNaw_17_axlj7c.jpg", goals: 1 },
  { teamId: "EcE_F", playerId: "EcE_F_06", name: "မမေသန္တာကို", number: "15", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782932583/MayThandarKo_15_o0dmdn.jpg", goals: 1 },
  { teamId: "CE_F", playerId: "CE_F_05", name: "မဆုထက်မြတ်နိုး", number: "11", profile_string_link: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782933155/HsuHtetMyatNoe_11_gfu96e.jpg", goals: 1 },
];
