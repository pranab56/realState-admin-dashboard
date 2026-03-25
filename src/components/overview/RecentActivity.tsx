"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Building2,
  CheckSquare,
  Clock,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const activities = [
  {
    icon: Building2,
    iconBg: "#EBF3FD",
    iconColor: "#4A90D9",
    title: "New property listed in Beverly Hills by Agent Sarah J.",
    time: "2 minutes ago",
  },
  {
    icon: CheckSquare,
    iconBg: "#E8F5E9",
    iconColor: "#2B9724",
    title: "Identity verified for 4 new customer accounts.",
    time: "2 minutes ago",
  },
  {
    icon: Clock,
    iconBg: "#FEF0E4",
    iconColor: "#F1913D",
    title: "Payout pending approval for Owner Group #402.",
    time: "2 minutes ago",
  },
  {
    icon: RefreshCw,
    iconBg: "#F3F0FB",
    iconColor: "#9B85C4",
    title: "Core system update successfully deployed (v2.4.1).",
    time: "2 minutes ago",
  },
];

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="h-full"
    >
      <Card className="border-none shadow-sm bg-white h-full flex flex-col p-0">
        <CardContent className="p-6 flex flex-col gap-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>
              System Activity
            </h2>
            <Link
              href="#"
              className="text-sm font-semibold hover:underline transition-colors"
              style={{ color: "#F1913D" }}
            >
              View More
            </Link>
          </div>

          {/* Activity list */}
          <div className="flex flex-col gap-4">
            {activities.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  {/* Icon box */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.iconColor }} />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-medium leading-snug" style={{ color: "#2C2E33" }}>
                      {item.title}
                    </p>
                    <p className="text-xs" style={{ color: "#F1913D" }}>
                      {item.time}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
