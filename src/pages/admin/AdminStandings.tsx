import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, updateStandingRow } from "@/lib/supabase";
import { useStandings } from "@/hooks/useStandings";
import { TEAMS, type StandingEntry } from "@/data/tournament";
import { TeamCrest } from "@/components/shared/TeamCrest";
import { AdminTabBar } from "@/components/shared/AdminTabBar";
import { toast } from "@/hooks/use-toast";

interface EditState {
  teamId: string;
  p: string;
  w: string;
  d: string;
  l: string;
  gf: string;
  ga: string;
}

function parseNum(v: string): number {
  if (v === "") return 0;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

function NumField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 text-center font-barlow text-lg font-bold bg-card border border-border rounded-lg focus:outline-none focus:border-foreground/40 disabled:opacity-60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  );
}

export default function AdminStandings() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: standings = [], isLoading } = useStandings();
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/fifaOwner/login");
  };

  const openEdit = (entry: StandingEntry) => {
    setEdit({
      teamId: entry.teamId,
      p: String(entry.p),
      w: String(entry.w),
      d: String(entry.d),
      l: String(entry.l),
      gf: String(entry.gf),
      ga: String(entry.ga),
    });
  };

  const gd =
    (edit ? parseNum(edit.gf) : 0) - (edit ? parseNum(edit.ga) : 0);
  const pts = (edit ? parseNum(edit.w) : 0) * 3 + (edit ? parseNum(edit.d) : 0);

  const handleSave = async () => {
    if (!edit || saving) return;
    setSaving(true);
    const { error } = await updateStandingRow(edit.teamId, {
      p: parseNum(edit.p),
      w: parseNum(edit.w),
      d: parseNum(edit.d),
      l: parseNum(edit.l),
      gf: parseNum(edit.gf),
      ga: parseNum(edit.ga),
      gd,
      pts,
    });
    setSaving(false);
    if (error) {
      toast({
        title: "Could not save standings",
        description: error,
        variant: "destructive",
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["standings"] });
    setEdit(null);
  };

  const teamById = (id: string) => TEAMS.find((t) => t.id === id);

  const renderGroup = (title: string, group: string, gender: string) => {
    const rows = TEAMS.filter((t) => t.group === group && t.gender === gender)
      .map((t) => ({
        team: t,
        entry: standings.find((s) => s.teamId === t.id),
      }))
      .filter((r) => r.entry);
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-barlow text-xl font-bold tracking-wide text-foreground">
          {title}
        </h3>
        <div className="bg-card rounded-xl border border-card-border overflow-hidden shadow-md">
          {rows.map(({ team, entry }, i) => (
            <button
              key={team.id}
              type="button"
              onClick={() => entry && openEdit(entry)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-3 text-left active:bg-white/5 transition-colors ${i > 0 ? "border-t border-border/40" : ""}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <TeamCrest name={team.name} logo={team.logo} size="sm" />
                <span className="font-barlow font-bold text-[15px] tracking-wide truncate">
                  {team.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                <span>P {entry?.p}</span>
                <span>W {entry?.w}</span>
                <span>D {entry?.d}</span>
                <span>L {entry?.l}</span>
                <span>GF {entry?.gf}</span>
                <span>GA {entry?.ga}</span>
                <span className="text-foreground font-bold">PTS {entry?.pts}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const editingTeam = edit ? teamById(edit.teamId) : undefined;

  return (
    <div className="w-full min-h-[100dvh] max-w-[430px] mx-auto bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-background/98 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <p className="font-barlow text-lg font-extrabold tracking-wide">
            Standings Editor
          </p>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-foreground active:bg-white/10 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <AdminTabBar active="table" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-8">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-16 text-sm">
            Loading...
          </div>
        ) : (
          <>
            {renderGroup("GROUP A · MALE", "A", "Male")}
            {renderGroup("GROUP B · MALE", "B", "Male")}
            {renderGroup("FEMALE", "Female", "Female")}
            <p className="text-[11px] text-muted-foreground px-1">
              Tap a row to edit. GD and PTS are derived (GD = GF − GA, PTS = W×3 + D).
              Female rows are also auto-recomputed when a female match finishes or is reverted.
            </p>
          </>
        )}
      </div>

      <AnimatePresence>
        {edit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => !saving && setEdit(null)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card border-t border-border rounded-t-2xl px-5 pt-5 pb-8 flex flex-col gap-4"
            >
              <div className="flex items-center justify-center gap-2">
                <TeamCrest name={editingTeam?.name ?? ""} logo={editingTeam?.logo} size="sm" />
                <p className="font-barlow text-lg font-extrabold tracking-wide">
                  {editingTeam?.name ?? edit.teamId}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <NumField label="P" value={edit.p} onChange={(v) => setEdit({ ...edit, p: v })} disabled={saving} />
                <NumField label="W" value={edit.w} onChange={(v) => setEdit({ ...edit, w: v })} disabled={saving} />
                <NumField label="D" value={edit.d} onChange={(v) => setEdit({ ...edit, d: v })} disabled={saving} />
                <NumField label="L" value={edit.l} onChange={(v) => setEdit({ ...edit, l: v })} disabled={saving} />
                <NumField label="GF" value={edit.gf} onChange={(v) => setEdit({ ...edit, gf: v })} disabled={saving} />
                <NumField label="GA" value={edit.ga} onChange={(v) => setEdit({ ...edit, ga: v })} disabled={saving} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    GD
                  </span>
                  <div className="h-11 flex items-center justify-center font-barlow text-lg font-bold bg-white/4 border border-white/8 rounded-lg">
                    {gd}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    PTS
                  </span>
                  <div className="h-11 flex items-center justify-center font-barlow text-lg font-bold bg-white/4 border border-white/8 rounded-lg">
                    {pts}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-[52px] rounded-xl bg-foreground text-background font-bold text-sm tracking-wide active:opacity-80 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEdit(null)}
                disabled={saving}
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
