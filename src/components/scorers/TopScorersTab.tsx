import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TEAMS, getTeamName, type Scorer } from "@/data/tournament";
import { useTopScorers } from "@/hooks/useTopScorers";
import { TeamCrest } from "@/components/shared/TeamCrest";
import { cloudinary } from "@/lib/cloudinary";
import footballImg from "@/assets/football.svg";

function isValidPhotoUrl(url: string | undefined): boolean {
  return !!url && url !== "none";
}

function teamLogo(teamId: string): string | undefined {
  return TEAMS.find((t) => t.id === teamId)?.logo;
}

function ScorerAvatar({ scorer, size }: { scorer: Scorer; size: number }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = isValidPhotoUrl(scorer.profile_string_link) && !imgError;
  return (
    <div
      className="rounded-full flex items-center justify-center border-2 border-white/12 bg-white/5 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        <img
          src={cloudinary(scorer.profile_string_link)}
          alt=""
          loading="lazy"
          decoding="async"
          width={184}
          height={184}
          onError={() => setImgError(true)}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <img src={footballImg} alt="" className="rounded-full object-contain bg-white" style={{ width: size * 0.6, height: size * 0.6 }} />
      )}
    </div>
  );
}

function ScorerCard({ scorer, delay, onOpen }: { scorer: Scorer; delay: number; onOpen: () => void }) {
  const teamName = getTeamName(scorer.teamId);
  const logo = teamLogo(scorer.teamId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      data-testid={`scorer-card-${scorer.teamId}-${scorer.number}`}
      className="relative rounded-2xl border overflow-hidden flex items-center gap-5 px-5 py-7 cursor-pointer bg-card border-card-border"
    >
      {/* faded watermark */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-barlow text-[80px] font-extrabold leading-none text-foreground/[0.04] select-none pointer-events-none">
        {scorer.goals}
      </span>

      {/* avatar */}
      <div className="relative shrink-0">
        <ScorerAvatar scorer={scorer} size={92} />
        <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
          <span className="text-[11px] font-extrabold text-white leading-none">{scorer.goals}</span>
        </span>
      </div>

      {/* info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0 relative z-10">
        <p className="font-myanmar text-[17px] font-extrabold leading-snug truncate text-foreground py-0.5">
          {scorer.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <TeamCrest name={teamName} logo={logo} size="sm" />
          <span className="text-[13px] text-muted-foreground font-medium truncate">{teamName}</span>
          <span className="text-[11px] text-muted-foreground/40 font-bold ml-1">#{scorer.number}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-barlow text-2xl font-black leading-none text-foreground">
            {scorer.goals}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            {scorer.goals === 1 ? "Goal" : "Goals"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewAvatar({ scorer }: { scorer: Scorer }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = isValidPhotoUrl(scorer.profile_string_link) && !imgError;
  if (showPhoto) {
    return (
      <img
        src={cloudinary(scorer.profile_string_link, { w: 480, h: 480 })}
        alt=""
        loading="lazy"
        decoding="async"
        width={440}
        height={440}
        onError={() => setImgError(true)}
        className="w-full h-full rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
      <img src={footballImg} alt="" className="w-40 h-40 object-contain" />
    </div>
  );
}

function PlayerPreviewModal({ scorer, onClose }: { scorer: Scorer; onClose: () => void }) {
  const teamName = getTeamName(scorer.teamId);
  const logo = teamLogo(scorer.teamId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] flex flex-col items-center"
      >
        <button
          onClick={onClose}
          data-testid="close-preview"
          className="self-end mb-3 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative">
          <div className="w-[220px] h-[220px] rounded-full flex items-center justify-center border-4 border-amber-400/40 shadow-[0_0_60px_rgba(251,191,36,0.25)] overflow-hidden">
            <PreviewAvatar scorer={scorer} />
          </div>
          <span className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
            <span className="text-lg font-extrabold text-white leading-none">{scorer.goals}</span>
          </span>
        </div>

        <p className="font-myanmar text-[22px] font-extrabold text-foreground mt-6 text-center leading-snug px-2">
          {scorer.name}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <TeamCrest name={teamName} logo={logo} size="md" />
          <span className="text-[15px] text-muted-foreground font-semibold">{teamName}</span>
          <span className="text-[13px] text-muted-foreground/40 font-bold ml-1">#{scorer.number}</span>
        </div>

        <div className="flex items-center gap-2 mt-4 bg-white/5 border border-white/10 rounded-full px-5 py-2">
          <span className="font-barlow text-2xl font-black text-amber-400 leading-none">{scorer.goals}</span>
          <span className="text-[12px] text-muted-foreground uppercase tracking-widest font-semibold">
            {scorer.goals === 1 ? "Goal scored" : "Goals scored"}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TopScorersTab() {
  const [activeGender, setActiveGender] = useState<"male" | "female">("male");
  const [previewScorer, setPreviewScorer] = useState<Scorer | null>(null);
  const { data: scorers = [] } = useTopScorers(activeGender);
  const sorted = [...scorers].sort((a, b) => b.goals - a.goals);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col"
    >
      {/* Gender toggle */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-3 pb-3">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="h-[1px] w-4 bg-white/15" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/35">Top Scorers</span>
          <div className="h-[1px] flex-1 bg-white/15" />
        </div>
        <div className="flex bg-white/5 border border-white/8 rounded-xl p-1 relative">
          {(["male", "female"] as const).map((g) => {
            const isActive = activeGender === g;
            return (
              <button
                key={g}
                onClick={() => setActiveGender(g)}
                className={`flex-1 relative py-2 text-sm font-semibold tracking-wide rounded-lg transition-colors duration-200 z-10 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="scorer-gender-pill"
                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/15"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10 uppercase text-[12px] tracking-widest">
                  {g === "male" ? "Male" : "Female"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeGender}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {sorted.map((scorer, i) => (
              <ScorerCard
                key={`${scorer.teamId}-${scorer.number}`}
                scorer={scorer}
                delay={i * 0.04}
                onOpen={() => setPreviewScorer(scorer)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-[11px] text-muted-foreground/50 font-medium mt-5 px-4 leading-relaxed">
          Updated after every matchday.
        </p>
      </div>

      <AnimatePresence>
        {previewScorer && (
          <PlayerPreviewModal scorer={previewScorer} onClose={() => setPreviewScorer(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
