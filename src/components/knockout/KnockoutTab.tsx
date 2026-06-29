import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal } from "lucide-react";

function TbdCrest({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-full border-2 border-dashed border-white/20 bg-white/4 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="font-barlow text-[11px] font-bold text-white/30 tracking-widest">
        TBD
      </span>
    </div>
  );
}

function VsDivider() {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-[1px] h-5 bg-white/10" />
      <span className="font-barlow text-xs font-bold text-white/30 tracking-widest">
        VS
      </span>
      <div className="w-[1px] h-5 bg-white/10" />
    </div>
  );
}

interface FinalCardProps {
  type: "cup" | "bronze";
  label: string;
  date: string;
  time: string;
  delay?: number;
}

function FinalCard({ type, label, date, time, delay = 0 }: FinalCardProps) {
  const isCup = type === "cup";

  const goldGlow = "shadow-[0_4px_32px_rgba(251,191,36,0.18)]";
  const bronzeGlow = "shadow-[0_4px_32px_rgba(180,100,30,0.18)]";

  const borderColor = isCup ? "border-amber-400/25" : "border-orange-700/30";
  const topBar = isCup
    ? "bg-gradient-to-r from-yellow-500/60 via-amber-400/80 to-yellow-600/60"
    : "bg-gradient-to-r from-orange-700/60 via-amber-700/70 to-orange-800/60";
  const iconColor = isCup ? "text-amber-400" : "text-orange-500";
  const glowClass = isCup ? goldGlow : bronzeGlow;
  const bgGrad = isCup
    ? "bg-gradient-to-b from-amber-950/40 to-card"
    : "bg-gradient-to-b from-orange-950/30 to-card";

  const Icon = isCup ? Trophy : Medal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border ${borderColor} ${bgGrad} ${glowClass} overflow-hidden`}
    >
      {/* colour top strip */}
      <div className={`h-[3px] w-full ${topBar}`} />

      <div className="px-5 pt-5 pb-6">
        {/* Label row */}
        <div className="flex items-center gap-2 mb-5">
          <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2.2} />
          <span
            className={`text-[11px] font-bold tracking-widest uppercase ${iconColor}`}
          >
            {label}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex flex-col items-center gap-2.5">
            <TbdCrest size={52} />
            <span className="font-barlow text-[15px] font-bold text-white/35 tracking-widest">
              UNKNOWN
            </span>
          </div>

          <VsDivider />

          <div className="flex-1 flex flex-col items-center gap-2.5">
            <TbdCrest size={52} />
            <span className="font-barlow text-[15px] font-bold text-white/35 tracking-widest">
              UNKNOWN
            </span>
          </div>
        </div>

        {/* Date/time */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <div
            className={`h-[1px] flex-1 ${isCup ? "bg-amber-400/15" : "bg-orange-700/20"}`}
          />
          <span className="text-[11px] text-white/35 font-medium tracking-wide">
            {date} · {time}
          </span>
          <div
            className={`h-[1px] flex-1 ${isCup ? "bg-amber-400/15" : "bg-orange-700/20"}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function KnockoutTab() {
  const [activeGender, setActiveGender] = useState<"male" | "female">("male");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col"
    >
      {/* Gender toggle */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-3 pb-3">
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
                    layoutId="gender-pill"
                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/15"
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.35,
                    }}
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

      <div className="px-4 py-6 flex flex-col gap-4">
        <AnimatePresence mode="wait" initial={false}>
          {activeGender === "male" ? (
            <motion.div
              key="male"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Section header */}
              <SectionHeader label="Cup Finals" />

              <FinalCard
                type="cup"
                label="Cup Final"
                date="Thu 10 Jul"
                time="3:00 PM"
                delay={0.05}
              />
              <FinalCard
                type="bronze"
                label="Bronze Final"
                date="Thu 10 Jul"
                time="1:00 PM"
                delay={0.15}
              />
            </motion.div>
          ) : (
            <motion.div
              key="female"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <SectionHeader label="Cup Final" />

              <FinalCard
                type="cup"
                label="Cup Final"
                date="Thu 10 Jul"
                time="5:00 PM"
                delay={0.05}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Qualifier note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-[11px] text-muted-foreground/50 font-medium mt-2 px-4 leading-relaxed"
        >
          Teams will be confirmed after the group stage concludes.
        </motion.p>
      </div>
    </motion.div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="h-[1px] w-4 bg-white/15" />
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/35">
        {label}
      </span>
      <div className="h-[1px] flex-1 bg-white/15" />
    </div>
  );
}
