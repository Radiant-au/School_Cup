import { useLocation } from "wouter";

export function AdminTabBar({ active }: { active: "fixtures" | "table" }) {
  const [, navigate] = useLocation();
  const base =
    "flex-1 h-9 rounded-lg text-xs font-bold tracking-wide transition-colors";
  return (
    <div className="flex gap-1 px-4 pb-2">
      <button
        type="button"
        onClick={() => navigate("/fifaOwner")}
        className={`${base} ${active === "fixtures" ? "bg-foreground text-background" : "bg-white/5 text-muted-foreground"}`}
      >
        Fixtures
      </button>
      <button
        type="button"
        onClick={() => navigate("/fifaOwner/standings")}
        className={`${base} ${active === "table" ? "bg-foreground text-background" : "bg-white/5 text-muted-foreground"}`}
      >
        Table
      </button>
    </div>
  );
}
