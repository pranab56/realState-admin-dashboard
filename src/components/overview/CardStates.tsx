"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Building2, DollarSign, TicketCheck, Users } from "lucide-react";

interface CardStatesProps {
  totalRevenue?: number;
  totalUsers?: number;
  totalProperties?: number;
  totalReservations?: number;
}

export default function CardStates({
  totalRevenue = 0,
  totalUsers = 0,
  totalProperties = 0,
  totalReservations = 0
}: CardStatesProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "#E3F2FD",
      iconColor: "#1976D2"
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      bgColor: "#F3E5F5",
      iconColor: "#7B1FA2"
    },
    {
      title: "Total Properties",
      value: totalProperties.toLocaleString(),
      icon: Building2,
      bgColor: "#E8F5E9",
      iconColor: "#2B9724"
    },
    {
      title: "Total Reservations",
      value: totalReservations.toLocaleString(),
      icon: TicketCheck,
      bgColor: "#FFF3E0",
      iconColor: "#F1913D"
    },
  ];

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
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
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
