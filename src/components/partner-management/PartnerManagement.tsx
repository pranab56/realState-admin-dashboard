"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/* ── Stat cards ─────────────────────────────────────────────── */
const stats = [
  { label: "Total Partners", value: "12,482", icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
  { label: "Active Inventory", value: "3,829", icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
  { label: "Total Revenue (ETB)", value: "4.2M", icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
  { label: "Avg. Partnership Score", value: "94.2%", icon: TrendingUp, bgColor: "#FEE2E2", color: "#DC3545" },
];

/* ── Tab filter ─────────────────────────────────────────────── */
const TABS = ["All Partners", "Hotels", "Transport", "Service Providers"] as const;
type Tab = (typeof TABS)[number];

/* ── Status badge ────────────────────────────────────────────── */
type Status = "Active" | "Reviewing";

function StatusBadge({ status }: { status: Status }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: "#FEF0E4", color: "#F1913D" }}>
      Reviewing
    </span>
  );
}

/* ── Dummy rows ─────────────────────────────────────────────── */
const AVATAR = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&h=48&fit=crop&auto=format";

const partners = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: "Grand Plaza Resorts",
  partnerId: "PAR-88219",
  type: "Hotel",
  level: "Platinum",
  status: (i % 2 === 0 ? "Active" : "Reviewing") as Status,
  inventory: "120 Rooms",
  revenue: "ETB 250,00",
}));

const TOTAL = 240;
const PER_PAGE = 9;
const LAST_PG = Math.ceil(TOTAL / PER_PAGE);
const PAGES = [1, 2, 3, "...", LAST_PG];

/* ── Main component ──────────────────────────────────────────── */
export default function PartnerManagement() {
  const [tab, setTab] = useState<Tab>("All Partners");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleAll = () =>
    setSelected(selected.length === partners.length ? [] : partners.map((p) => p.id));

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="px-5 py-3 border-none shadow-sm bg-white flex flex-col gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: s.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "#6C757D" }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: "#2C2E33" }}>{s.value}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Partners List Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-sm bg-white overflow-hidden p-0">

          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>Partners List</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 px-6 border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "#F2F2F2" }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); setSelected([]); }}
                className="pb-3 text-sm font-semibold relative cursor-pointer whitespace-nowrap transition-colors"
                style={{ color: tab === t ? "#2C2E33" : "#6C757D" }}
              >
                {t}
                {tab === t && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: "#F1913D" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#F2F2F2" }}>
                  <TableHead className="w-10 pl-6">
                    <Checkbox
                      checked={selected.length === partners.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Partner Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Level
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Inventory
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Total Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {partners.map((p) => (
                  <TableRow
                    key={p.id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selected.includes(p.id)}
                        onCheckedChange={() => toggle(p.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={AVATAR}
                            alt={p.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{p.name}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>ID: {p.partnerId}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>{p.type}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>{p.level}</span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>{p.inventory}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{p.revenue}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: "#F2F2F2" }}
          >
            <p className="text-sm" style={{ color: "#6C757D" }}>
              Showing{" "}
              <span className="font-semibold" style={{ color: "#2C2E33" }}>
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}
              </span>{" "}
              of{" "}
              <span className="font-semibold" style={{ color: "#2C2E33" }}>{TOTAL}</span>{" "}
              entries
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: "#2C2E33" }}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {PAGES.map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-1 text-sm" style={{ color: "#6C757D" }}>...</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(Number(p))}
                    className="w-8 h-8 text-sm rounded-lg font-medium transition-colors cursor-pointer"
                    style={
                      page === p
                        ? { backgroundColor: "#F1913D", color: "#FFFFFF" }
                        : { color: "#2C2E33", backgroundColor: "transparent" }
                    }
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(LAST_PG, p + 1))}
                disabled={page === LAST_PG}
                className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: "#2C2E33" }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </Card>
      </motion.div>
    </div>
  );
}
