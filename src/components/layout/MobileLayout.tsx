import { ReactNode } from "react";
import { Calendar, BarChart2, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileLayout({
  children,
  activeTab,
  onTabChange,
}: MobileLayoutProps) {
  const tabs = [
    { id: "fixtures", label: "Fixtures", icon: Calendar },
    { id: "table", label: "Table", icon: BarChart2 },
    { id: "knockout", label: "Cup", icon: Trophy },
  ];

  return (
    <div className="w-full min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* Signature header strip — blue glow */}
      <div className="h-[3px] w-full bg-gradient-to-b from-accent to-transparent absolute top-0 z-50 pointer-events-none" />

      {/* Header */}
      <header className="pt-6 pb-4 px-4 bg-background sticky top-0 z-40 border-b border-border">
        <h1 className="font-barlow text-2xl font-bold text-center text-foreground tracking-wide uppercase drop-shadow-[0_0_12px_rgba(0,144,255,0.4)]">
          School Cup 2026
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar relative">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center w-full relative outline-none"
              >
                <div
                  className={`relative flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? "text-accent" : "text-muted-foreground"}`}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium tracking-wide">
                    {tab.label}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-3 w-12 h-1 bg-accent rounded-b-full shadow-[0_2px_10px_rgba(0,144,255,0.6)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
