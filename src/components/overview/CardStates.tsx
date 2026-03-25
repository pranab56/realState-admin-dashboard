"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";

const stats = [
  { title: "Total Revenue", value: "ETB250,00", change: null },
  { title: "Active Users", value: "42,840", change: null },
  { title: "Total Properties", value: "1,248", change: null },
  { title: "Growth Rate", value: "+18.4%", change: null },
];

export default function CardStates() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Card className="border-none shadow-sm bg-white h-full p-0">
            <CardContent className="p-5 flex flex-col gap-3">
              {/* Icon box */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#E8F5E9" }}
              >
                <CalendarCheck className="w-5 h-5" style={{ color: "#2B9724" }} />
              </div>

              {/* Label */}
              <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                {stat.title}
              </p>

              {/* Value */}
              <p className="text-2xl font-bold" style={{ color: "#2C2E33" }}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
