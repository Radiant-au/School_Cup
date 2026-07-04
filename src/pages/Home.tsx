import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { FixtureTab } from "@/components/fixtures/FixtureTab";
import { TableTab } from "@/components/table/TableTab";
import { TopScorersTab } from "@/components/scorers/TopScorersTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("fixtures");

  return (
    <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatePresence mode="wait" initial={false}>
        {activeTab === "fixtures" && <FixtureTab key="fixtures" />}
        {activeTab === "table" && <TableTab key="table" />}
        {activeTab === "scorers" && <TopScorersTab key="scorers" />}
      </AnimatePresence>
    </MobileLayout>
  );
}
