"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const segments = [
  { label: "Customers", count: 24400, color: "#2C2E33", pct: 100 },
  { label: "Customers", count: 12120, color: "#4A90D9", pct: 50 },
  { label: "Customers", count: 5280, color: "#F1913D", pct: 22 },
  { label: "Customers", count: 1040, color: "#9B85C4", pct: 4 },
];

export default function BarChart() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-none shadow-sm bg-white h-full flex flex-col p-0">
        <CardContent className="p-6 flex flex-col gap-5 flex-1">
          <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>
            User Distribution
          </h2>

          {/* Bar rows */}
          <div className="flex flex-col gap-5 flex-1">
            {segments.map((seg, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "#6C757D" }}>{seg.label}</span>
                  <span className="text-sm font-bold" style={{ color: "#2C2E33" }}>
                    {seg.count.toLocaleString()}
                  </span>
                </div>
                {/* Track */}
                <div className="h-2 rounded-full w-full" style={{ backgroundColor: "#F2F2F2" }}>
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: seg.color, width: `${seg.pct}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${seg.pct}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Active footer */}
          <div
            className="mt-4 rounded-xl p-4 flex items-center gap-4"
            style={{ backgroundColor: "#F2F2F2" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#E0E0E0" }}
            >
              <User className="w-5 h-5" style={{ color: "#6C757D" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#6C757D" }}>Monthly Active</p>
              <p className="text-base font-bold" style={{ color: "#2C2E33" }}>94.2% Retention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
