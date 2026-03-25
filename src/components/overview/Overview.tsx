"use client";

import BarChart from "@/components/overview/BarChart";
import CardStates from "@/components/overview/CardStates";
import LineChart from "@/components/overview/LineChart";
import RecentActivity from "@/components/overview/RecentActivity";

export default function Overview() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Row 1 — 4 Stat Cards */}
      <CardStates />

      {/* Row 2 — Revenue Growth chart (full width) */}
      <LineChart />

      {/* Row 3 — User Distribution + System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart />
        <RecentActivity />
      </div>

    </div>
  );
}
