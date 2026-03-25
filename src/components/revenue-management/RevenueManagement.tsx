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
} from "lucide-react";
import { useState } from "react";

/* ── Stat cards ─────────────────────────────────────────────── */
const stats = [
  { label: "Total Revenue", value: "ETB250,00", icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
  { label: "Pending Payouts", value: "ETB250,00", icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
  { label: "Platform Commissions", value: "ETB250,00", icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
  { label: "Active Disputes", value: "14", icon: CalendarCheck, bgColor: "#FEE2E2", color: "#DC3545" },
];

/* ── Status badge ────────────────────────────────────────────── */
type Status = "Active" | "Pending" | "Refunded";

function StatusBadge({ status }: { status: Status }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
        Active
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#FEF0E4", color: "#F1913D" }}>
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: "#FEE2E2", color: "#DC3545" }}>
      Refunded
    </span>
  );
}

/* ── Dummy rows ─────────────────────────────────────────────── */
const transactions = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  date: "Oct 24, 2023",
  txnId: "TXN-88294",
  type: "Property",
  amount: "ETB250,00",
  commission: "ETB250,00",
  status: (["Active", "Pending", "Refunded", "Active", "Active", "Pending", "Active", "Refunded", "Active"] as Status[])[i],
}));

const TOTAL = 240;
const PER_PAGE = 9;
const LAST_PG = Math.ceil(TOTAL / PER_PAGE);
const PAGES = [1, 2, 3, "...", LAST_PG];

/* ── Main component ──────────────────────────────────────────── */
export default function RevenueManagement() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleAll = () =>
    setSelected(selected.length === transactions.length ? [] : transactions.map((p) => p.id));

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

      {/* ── Transaction List Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-sm bg-white overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-3 pb-3">
            <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>Recent Transactions</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#F2F2F2" }}>
                  <TableHead className="w-10 pl-6">
                    <Checkbox
                      checked={selected.length === transactions.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Partner Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Transaction ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Commission
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transactions.map((t) => (
                  <TableRow
                    key={t.id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selected.includes(t.id)}
                        onCheckedChange={() => toggle(t.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>{t.date}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{t.txnId}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>{t.type}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{t.amount}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>{t.commission}</span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={t.status} />
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
