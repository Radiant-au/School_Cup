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
    scoreA: null,
    scoreB: null,
    finished: false,
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
    scoreA: null,
    scoreB: null,
    finished: false,
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
    scoreA: null,
    scoreB: null,
    finished: false,
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
    scoreA: null,
    scoreB: null,
    finished: false,
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
    scoreA: null,
    scoreB: null,
    finished: false,
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
    scoreA: null,
    scoreB: null,
    finished: false,
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
    scoreA: null,
    scoreB: null,
    finished: false,
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
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "18",
    date: "2026-07-04",
    time: "6:00 PM",
    teamA: "IS_F",
    teamB: "PrE_F",
    logoA: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782749016/IS_t4dbbs.jpg",
    logoB: "https://res.cloudinary.com/dw7kk0lvp/image/upload/v1782748741/PrE_rz6frk.jpg",
    group: "Female",
    gender: "Female",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  // Day 7
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
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "20",
    date: "2026-07-06",
    time: "6:00 PM",
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
  // Day 8
  {
    id: "21",
    date: "2026-07-07",
    time: "3:00 PM",
    teamA: "Group A 1st",
    teamB: "Group B 2nd",
    group: "Semi-final",
    gender: "Male",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "22",
    date: "2026-07-07",
    time: "4:30 PM",
    teamA: "Group B 1st",
    teamB: "Group A 2nd",
    group: "Semi-final",
    gender: "Male",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  // Day 9
  {
    id: "23",
    date: "2026-07-08",
    time: "5:00 PM",
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
    date: "2026-07-08",
    time: "6:00 PM",
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
  // Day 10 — Finals
  {
    id: "26",
    date: "2026-07-10",
    time: "3:00 PM",
    teamA: "TBD",
    teamB: "TBD",
    group: "Bronze Final",
    gender: "Male",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "25",
    date: "2026-07-10",
    time: "4:30 PM",
    teamA: "TBD",
    teamB: "TBD",
    group: "Final",
    gender: "Male",
    scoreA: null,
    scoreB: null,
    finished: false,
  },
  {
    id: "27",
    date: "2026-07-10",
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

export const MATCH_EVENTS: MatchEvent[] = [
  { matchId: "2", teamId: "AME", playerId: "AME_03" },
  { matchId: "2", teamId: "EcE(A)", playerId: "EcE_A_03" },
  { matchId: "2", teamId: "EcE(A)", playerId: "EcE_A_03" },
  { matchId: "4", teamId: "CE_M", playerId: "CE_B_03" },
  { matchId: "4", teamId: "CE_M", playerId: "CE_B_15" },
  { matchId: "4", teamId: "CE_M", playerId: "CE_B_15" },
  { matchId: "4", teamId: "EcE(B)", playerId: "EcE_B_07" },
  { matchId: "4", teamId: "EcE(B)", playerId: "EcE_B_13" },
  { matchId: "5", teamId: "PrE(B)", playerId: "PrE_B_10" },
  { matchId: "5", teamId: "PrE(B)", playerId: "PrE_B_10" },
  { matchId: "7", teamId: "IS(A)", playerId: "IS_A_14" },
  { matchId: "8", teamId: "PrE(A)", playerId: "PrE_A_03" },
  { matchId: "8", teamId: "AME", playerId: "AME_03" },
  { matchId: "8", teamId: "AME", playerId: "AME_09" },
];

export const STANDINGS: StandingEntry[] = [
  { teamId: "PrE(A)", p: 2, w: 0, d: 2, l: 0, gf: 2, ga: 2, gd: 0, pts: 2 },
  { teamId: "IS(A)", p: 2, w: 1, d: 1, l: 0, gf: 1, ga: 0, gd: 1, pts: 4 },
  { teamId: "AME", p: 2, w: 0, d: 1, l: 1, gf: 3, ga: 4, gd: -1, pts: 1 },
  { teamId: "EcE(A)", p: 2, w: 1, d: 0, l: 1, gf: 2, ga: 2, gd: 0, pts: 3 },
  { teamId: "IS_F", p: 2, w: 0, d: 2, l: 0, gf: 0, ga: 0, gd: 0, pts: 2 },
  { teamId: "CE_F", p: 1, w: 0, d: 1, l: 0, gf: 0, ga: 0, gd: 0, pts: 1 },
  { teamId: "CE_M", p: 1, w: 1, d: 0, l: 0, gf: 3, ga: 2, gd: 1, pts: 3 },
  { teamId: "EcE(B)", p: 1, w: 0, d: 0, l: 1, gf: 2, ga: 3, gd: -1, pts: 0 },
  { teamId: "IS(B)", p: 1, w: 0, d: 0, l: 1, gf: 0, ga: 2, gd: -2, pts: 0 },
  { teamId: "PrE(B)", p: 1, w: 1, d: 0, l: 0, gf: 2, ga: 0, gd: 2, pts: 3 },
  { teamId: "PrE_F", p: 1, w: 0, d: 1, l: 0, gf: 0, ga: 0, gd: 0, pts: 1 },
  { teamId: "AME_F", p: 1, w: 0, d: 1, l: 0, gf: 0, ga: 0, gd: 0, pts: 1 },
  { teamId: "EcE_F", p: 1, w: 0, d: 1, l: 0, gf: 0, ga: 0, gd: 0, pts: 1 },
];

export const TOURNAMENT_DATES = Array.from(
  new Set(MATCHES.map((m) => m.date)),
).sort();
