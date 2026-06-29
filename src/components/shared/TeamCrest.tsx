interface TeamCrestProps {
  name: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
}

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-10 h-10",
  lg: "w-9 h-9",
};

const textSizeClasses = {
  sm: "text-[7px]",
  md: "text-[11px]",
  lg: "text-[11px]",
};

export function TeamCrest({ name, logo, size = "md", isActive = false }: TeamCrestProps) {
  const initials = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase();

  const baseClass = `${sizeClasses[size]} rounded-full flex items-center justify-center shrink-0`;

  if (size === "lg") {
    const borderClass = isActive
      ? "border-2 border-foreground/60 bg-white/10"
      : "border-2 border-white/10 bg-white/4";
    const transitionClass = "transition-colors duration-200";

    if (logo) {
      return (
        <div className={`${baseClass} ${borderClass} ${transitionClass} overflow-hidden`}>
          <img src={logo} alt={name} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`${baseClass} ${borderClass} ${transitionClass}`}>
        <span className={`font-barlow ${textSizeClasses[size]} font-bold tracking-wider text-foreground/80`}>
          {initials}
        </span>
      </div>
    );
  }

  const borderClass = "border border-white/15 bg-white/6";

  if (logo) {
    return (
      <div className={`${baseClass} ${borderClass} overflow-hidden`}>
        <img src={logo} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${baseClass} ${borderClass}`}>
      <span className={`font-barlow ${textSizeClasses[size]} font-bold tracking-wider text-foreground/70`}>
        {initials}
      </span>
    </div>
  );
}
