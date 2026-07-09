import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Undo2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, recomputeStandingsForGroup } from "@/lib/supabase";
import { isKnockoutGroup } from "@/lib/knockout";
import { useMatches } from "@/hooks/useMatches";
import { useGoalEvents } from "@/hooks/useGoalEvents";
import { SQUADS } from "@/data/squads";
import { getTeamName, type Player } from "@/data/tournament";
import { toast } from "@/hooks/use-toast";

function PlayerButton({
  player,
  goals,
  onScore,
  disabled,
}: {
  player: Player;
  goals: number;
  onScore: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onScore}
      disabled={disabled}
      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors min-h-[56px] ${
        goals > 0
          ? "bg-green-500/8 border-green-500/25"
          : "bg-card border-card-border active:bg-white/5"
      } disabled:opacity-50`}
    >
      <span
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-barlow text-sm font-extrabold border ${
          goals > 0
            ? "bg-green-500/15 border-green-500/30 text-green-300"
            : "bg-white/5 border-white/10 text-foreground/70"
        }`}
      >
        {player.number}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-sm truncate">{player.name}</span>
        {goals > 0 && (
          <span className="block text-[11px] text-green-400 font-medium mt-0.5">
            {goals === 1 ? "1 goal" : `${goals} goals`}
          </span>
        )}
      </span>
      <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-foreground text-background font-bold text-xs">
        +1
      </span>
    </motion.button>
  );
}

function AdminLiveMatchContent() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeSide, setActiveSide] = useState<"A" | "B">("A");
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [scoringPlayerId, setScoringPlayerId] = useState<string | null>(null);
  const [undoingEventId, setUndoingEventId] = useState<string | null>(null);
  const [undoConfirmEventId, setUndoConfirmEventId] = useState<string | null>(
    null,
  );
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [penaltyAInput, setPenaltyAInput] = useState("");
  const [penaltyBInput, setPenaltyBInput] = useState("");

  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: events = [] } = useGoalEvents(id);

  const match = matches?.find((m) => m.id === id);

  if (matchesLoading || !matches) {
    return (
      <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Match not found.</p>
        <button
          onClick={() => navigate("/fifaOwner")}
          className="text-foreground text-sm underline"
        >
          Back to fixtures
        </button>
      </div>
    );
  }

  const teamAId = match.teamA;
  const teamBId = match.teamB;
  const teamAName = getTeamName(teamAId);
  const teamBName = getTeamName(teamBId);
  const teamAPlayers = SQUADS[teamAId] ?? [];
  const teamBPlayers = SQUADS[teamBId] ?? [];

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const scoreA = events.filter((e) => e.teamId === teamAId).length;
  const scoreB = events.filter((e) => e.teamId === teamBId).length;

  const isKnockout = isKnockoutGroup(match.group);
  const needsPenalties = isKnockout && scoreA === scoreB;
  const penA = penaltyAInput === "" ? null : Number(penaltyAInput);
  const penB = penaltyBInput === "" ? null : Number(penaltyBInput);
  const penaltiesValid =
    !needsPenalties ||
    (penA !== null &&
      penB !== null &&
      Number.isInteger(penA) &&
      Number.isInteger(penB) &&
      penA >= 0 &&
      penB >= 0 &&
      penA !== penB);

  const goalCounts: Record<string, number> = {};
  for (const ev of events) {
    goalCounts[ev.playerId] = (goalCounts[ev.playerId] ?? 0) + 1;
  }

  const activeTeamId = activeSide === "A" ? teamAId : teamBId;
  const activeTeamName = activeSide === "A" ? teamAName : teamBName;
  const activePlayers = activeSide === "A" ? teamAPlayers : teamBPlayers;

  const handleScore = async (player: Player) => {
    if (!isLive || scoringPlayerId) return;
    setScoringPlayerId(player.id);
    const { error } = await supabase.from("goal_events").insert({
      match_id: match.id,
      team_id: activeTeamId,
      player_id: player.id,
      player_number: player.number,
      player_name: player.name,
    });
    setScoringPlayerId(null);
    if (error) {
      toast({
        title: "Could not record goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUndo = async (eventId: string) => {
    if (undoingEventId) return;
    setUndoingEventId(eventId);
    const { error } = await supabase
      .from("goal_events")
      .delete()
      .eq("id", eventId);
    setUndoingEventId(null);
    setUndoConfirmEventId(null);
    if (error) {
      toast({
        title: "Could not undo goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFinish = async () => {
    if (!penaltiesValid) return;
    setFinishing(true);
    const tied = scoreA === scoreB;
    const penalty_a = isKnockout && tied ? penA : null;
    const penalty_b = isKnockout && tied ? penB : null;
    const { error } = await supabase
      .from("matches")
      .update({
        status: "finished",
        score_a: scoreA,
        score_b: scoreB,
        penalty_a,
        penalty_b,
      })
      .eq("id", match.id);

    setFinishing(false);
    setShowFinishConfirm(false);
    setPenaltyAInput("");
    setPenaltyBInput("");

    if (error) {
      toast({
        title: "Could not finish match",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (match.group === "Female") {
      const { error: standErr } = await recomputeStandingsForGroup("Female");
      if (standErr) {
        toast({
          title: "Standings recompute failed",
          description: standErr,
          variant: "destructive",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["standings"] });
    }

    await queryClient.invalidateQueries({ queryKey: ["matches"] });
    navigate("/fifaOwner");
  };

  const sortedEvents = [...events].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const undoConfirmEvent = undoConfirmEventId
    ? events.find((e) => e.id === undoConfirmEventId) ?? null
    : null;

  const handleRevert = async () => {
    setReverting(true);
    const { error: matchErr } = await supabase
      .from("matches")
      .update({
        status: "scheduled",
        score_a: null,
        score_b: null,
        penalty_a: null,
        penalty_b: null,
      })
      .eq("id", match.id);
    if (matchErr) {
      setReverting(false);
      setShowRevertConfirm(false);
      toast({
        title: "Could not revert match",
        description: matchErr.message,
        variant: "destructive",
      });
      return;
    }
    const { error: eventsErr } = await supabase
      .from("goal_events")
      .delete()
      .eq("match_id", match.id);
    if (eventsErr) {
      toast({
        title: "Match reverted, goal log cleanup failed",
        description: eventsErr.message,
        variant: "destructive",
      });
    }
    if (match.group === "Female") {
      const { error: standErr } = await recomputeStandingsForGroup("Female");
      if (standErr) {
        toast({
          title: "Standings recompute failed",
          description: standErr,
          variant: "destructive",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["standings"] });
    }
    await queryClient.invalidateQueries({ queryKey: ["matches"] });
    await queryClient.invalidateQueries({ queryKey: ["goal-events"] });
    setReverting(false);
    setShowRevertConfirm(false);
    navigate("/fifaOwner");
  };

  return (
    <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col">
      {/* header */}
      <div className="relative bg-background z-40 border-b border-border shrink-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate("/fifaOwner")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-foreground active:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {match.group === "Female"
              ? "FEMALE"
              : match.group === "Semi-final" ||
                  match.group === "Final" ||
                  match.group === "Bronze Final"
                ? match.group.toUpperCase()
                : `GROUP ${match.group}`}
          </span>
          {isLive && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          )}
          {isFinished && (
            <span className="ml-auto text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm">
              FULL TIME
            </span>
          )}
        </div>

        <div className="px-5 pb-4 pt-1">
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 font-barlow text-lg font-extrabold tracking-wide text-center truncate">
              {teamAName}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`font-barlow text-3xl font-extrabold ${isLive ? "text-red-400" : ""}`}>
                {scoreA}
              </span>
              <span className="font-barlow text-xl text-muted-foreground">-</span>
              <span className={`font-barlow text-3xl font-extrabold ${isLive ? "text-red-400" : ""}`}>
                {scoreB}
              </span>
            </div>
            <p className="flex-1 font-barlow text-lg font-extrabold tracking-wide text-center truncate">
              {teamBName}
            </p>
          </div>
        </div>

        {isLive && (
          <div className="flex border-t border-border">
            {(["A", "B"] as const).map((side) => {
              const name = side === "A" ? teamAName : teamBName;
              const isActive = activeSide === side;
              return (
                <button
                  key={side}
                  onClick={() => setActiveSide(side)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold relative transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {name}
                  {isActive && (
                    <motion.div
                      layoutId="admin-team-tab-bar"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-t-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isLive && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="px-4 pt-4 flex flex-col gap-2"
            >
              {activePlayers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No squad data for {activeTeamName}.
                </p>
              ) : (
                activePlayers.map((player) => (
                  <PlayerButton
                    key={player.id}
                    player={player}
                    goals={goalCounts[player.id] ?? 0}
                    onScore={() => handleScore(player)}
                    disabled={scoringPlayerId !== null}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLive && !isFinished && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            This match has not started yet.
          </div>
        )}

        {/* goal log */}
        <div className="px-4 pt-6 pb-10">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
            Goal Log
          </p>
          {sortedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No goals yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sortedEvents.map((ev) => (
                <motion.div
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between gap-2 bg-card border border-card-border rounded-lg px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-foreground/40 shrink-0">
                      #{ev.playerNumber}
                    </span>
                    <span className="text-sm font-medium truncate">{ev.playerName}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      ({ev.teamId === teamAId ? teamAName : teamBName})
                    </span>
                  </div>
                  {isLive && (
                    <button
                      onClick={() => setUndoConfirmEventId(ev.id)}
                      disabled={undoingEventId === ev.id}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-muted-foreground active:bg-white/10 transition-colors disabled:opacity-50"
                      aria-label="Undo goal"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* footer actions */}
      {(isLive || isFinished) && (
        <div className="px-4 py-4 border-t border-border shrink-0 bg-background flex flex-col gap-2">
          {isLive && (
            <button
              onClick={() => {
                setPenaltyAInput("");
                setPenaltyBInput("");
                setShowFinishConfirm(true);
              }}
              className="w-full h-[52px] rounded-xl bg-red-500/90 text-white font-bold text-sm tracking-wide active:opacity-80 transition-opacity"
            >
              Finish Match
            </button>
          )}
          <button
            onClick={() => setShowRevertConfirm(true)}
            disabled={reverting}
            className="w-full h-[52px] rounded-xl bg-white/5 text-foreground font-bold text-sm tracking-wide active:bg-white/10 transition-colors disabled:opacity-50"
          >
            {reverting ? "Reverting..." : "Revert to Scheduled"}
          </button>
        </div>
      )}

      {/* confirm dialog */}
      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => !finishing && setShowFinishConfirm(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card border-t border-border rounded-t-2xl px-5 pt-5 pb-8 flex flex-col gap-4"
            >
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="font-barlow text-xl font-extrabold">Finish Match?</p>
                <p className="text-sm text-muted-foreground">
                  Final score: {teamAName} {scoreA} - {scoreB} {teamBName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
              </div>
              {needsPenalties && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold tracking-widest text-amber-400/80 uppercase text-center">
                    Penalty Shootout
                  </p>
                  <div className="flex items-end justify-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-muted-foreground truncate max-w-[96px]">
                        {teamAName}
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={penaltyAInput}
                        onChange={(e) => setPenaltyAInput(e.target.value)}
                        className="w-16 h-12 text-center font-barlow text-2xl font-extrabold bg-card border border-border rounded-lg focus:outline-none focus:border-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="-"
                      />
                    </div>
                    <span className="font-barlow text-xl text-muted-foreground pb-3">
                      -
                    </span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-muted-foreground truncate max-w-[96px]">
                        {teamBName}
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={penaltyBInput}
                        onChange={(e) => setPenaltyBInput(e.target.value)}
                        className="w-16 h-12 text-center font-barlow text-2xl font-extrabold bg-card border border-border rounded-lg focus:outline-none focus:border-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="-"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Knockout tie — enter the shootout result. The two scores
                    must differ.
                  </p>
                </div>
              )}
              <button
                onClick={handleFinish}
                disabled={finishing || !penaltiesValid}
                className="w-full h-[52px] rounded-xl bg-red-500/90 text-white font-bold text-sm tracking-wide active:opacity-80 transition-opacity disabled:opacity-50"
              >
                {finishing ? "Finishing..." : "Confirm Finish"}
              </button>
              <button
                onClick={() => setShowFinishConfirm(false)}
                disabled={finishing}
                className="w-full h-[52px] rounded-xl bg-white/5 text-foreground font-bold text-sm tracking-wide active:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* undo confirm dialog */}
      <AnimatePresence>
        {undoConfirmEventId && undoConfirmEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => !undoingEventId && setUndoConfirmEventId(null)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card border-t border-border rounded-t-2xl px-5 pt-5 pb-8 flex flex-col gap-4"
            >
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="font-barlow text-xl font-extrabold">Undo goal?</p>
                <p className="text-sm text-muted-foreground">
                  #{undoConfirmEvent.playerNumber} {undoConfirmEvent.playerName} (
                  {undoConfirmEvent.teamId === teamAId ? teamAName : teamBName})
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will remove the goal from the live score.
                </p>
              </div>
              <button
                onClick={() => undoConfirmEventId && handleUndo(undoConfirmEventId)}
                disabled={undoingEventId === undoConfirmEventId}
                className="w-full h-[52px] rounded-xl bg-red-500/90 text-white font-bold text-sm tracking-wide active:opacity-80 transition-opacity disabled:opacity-50"
              >
                {undoingEventId === undoConfirmEventId
                  ? "Removing..."
                  : "Confirm Undo"}
              </button>
              <button
                onClick={() => setUndoConfirmEventId(null)}
                disabled={undoingEventId !== null}
                className="w-full h-[52px] rounded-xl bg-white/5 text-foreground font-bold text-sm tracking-wide active:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* revert confirm dialog */}
      <AnimatePresence>
        {showRevertConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => !reverting && setShowRevertConfirm(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card border-t border-border rounded-t-2xl px-5 pt-5 pb-8 flex flex-col gap-4"
            >
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="font-barlow text-xl font-extrabold">
                  Revert to Scheduled?
                </p>
                <p className="text-sm text-muted-foreground">
                  {teamAName} {scoreA} - {scoreB} {teamBName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status resets to scheduled, scores clear, and this match's
                  goal events are deleted.
                </p>
              </div>
              <button
                onClick={handleRevert}
                disabled={reverting}
                className="w-full h-[52px] rounded-xl bg-foreground text-background font-bold text-sm tracking-wide active:opacity-80 transition-opacity disabled:opacity-50"
              >
                {reverting ? "Reverting..." : "Confirm Revert"}
              </button>
              <button
                onClick={() => setShowRevertConfirm(false)}
                disabled={reverting}
                className="w-full h-[52px] rounded-xl bg-white/5 text-foreground font-bold text-sm tracking-wide active:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminLiveMatch() {
  return <AdminLiveMatchContent />;
}