"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "JAN", value: 18000 },
  { month: "FEB", value: 42000 },
  { month: "MAR", value: 28000 },
  { month: "APR", value: 55000 },
  { month: "MAY", value: 38000 },
  { month: "JUN", value: 25000 },
  { month: "JUL", value: 32000 },
  { month: "AUG", value: 72000 },
  { month: "SEP", value: 15000 },
  { month: "OCT", value: 48000 },
  { month: "NOV", value: 62000 },
  { month: "DEC", value: 35000 },
];

export default function LineChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-none shadow-sm bg-white overflow-hidden p-0">
        <CardHeader className="flex flex-row items-start justify-between pb-0 px-6 pt-6">
          <div>
            <p className="text-lg font-bold" style={{ color: "#2C2E33" }}>
              Revenue Growth
            </p>
            <p className="text-sm mt-0.5" style={{ color: "#6C757D" }}>
              Monthly breakdown of gross revenue
            </p>
          </div>
          <Select defaultValue="monthly">
            <SelectTrigger
              className="w-[120px] rounded-lg text-sm border"
              style={{ borderColor: "#F2F2F2", color: "#6C757D", backgroundColor: "#FAFAFA" }}
            >
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="px-2 pb-4 pt-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F1913D" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F1913D" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6C757D", fontSize: 12, fontWeight: 500 }}
                tickMargin={16}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis hide domain={["dataMin - 5000", "dataMax + 10000"]} />


              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  padding: "8px 14px",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`ETB ${value.toLocaleString()}`, "Revenue"]}
                cursor={{ stroke: "#F1913D", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#F1913D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                dot={false}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
