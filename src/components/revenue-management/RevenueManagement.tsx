"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetRevenueQuery } from "@/features/revenue/revenueApi";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import MarkAllSeenButton from "@/components/notifications/MarkAllSeenButton";
import NewPulseDot from "@/components/notifications/NewPulseDot";

import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye
} from "lucide-react";
import { useState } from "react";
import { CustomLoading } from '../../hooks/CustomLoading';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const STAT_META = [
  { label: "Total Revenue", icon: DollarSign, bgColor: "#E8F5E9", color: "#2B9724" },
  { label: "Pending Payouts", icon: Clock, bgColor: "#FEF0E4", color: "#F1913D" },
  { label: "Platform Commissions", icon: Briefcase, bgColor: "#E3F2FD", color: "#1976D2" },
  { label: "Active Disputes", icon: AlertCircle, bgColor: "#FEE2E2", color: "#DC3545" },
];

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  uid?: string;
}

interface Pricing {
  currency?: string;
  pricePerUnit?: number;
  units?: number;
  serviceFee?: number;
  total?: number;
}

interface Reference {
  type?: string;
  id?: { pricing?: Pricing };
}

interface Transaction {
  _id: string;
  user?: User;
  createdAt?: string;
  type?: string;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
  reference?: Reference;
  status?: string;
  isPaid?: boolean;
  platformFee?: number;
}

/* ── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "";
  if (s === "completed" || s === "active" || s === "paid") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
        Completed
      </span>
    );
  }
  if (s === "pending") {
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
      {status || "Unknown"}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function RevenueManagement() {
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: revenueData, isLoading, isError } = useGetRevenueQuery({ page }, { pollingInterval: 3000 });
  useMarkPageSeen("revenue", revenueData?.pagination?.total);
  const { isNew, dismiss, dismissAll } = useNewItemsTracker(
    "revenue",
    (revenueData?.data || []).map((t: Transaction) => t._id)
  );

  const transactions = revenueData?.data || [];
  const newCount = transactions.filter((t: Transaction) => isNew(t._id)).length;
  const pagination = revenueData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  const handleViewDetails = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load revenue data</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  // ── Computed stat values from API data ──────────────────────
  const totalRevenue = transactions
    .filter((t: Transaction) => t.isPaid && t.status === "completed")
    .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);

  const pendingPayouts = transactions
    .filter((t: Transaction) => !t.isPaid || t.status === "pending")
    .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);

  const platformCommissions = transactions
    .filter((t: Transaction) => t.platformFee != null)
    .reduce((sum: number, t: Transaction) => sum + (t.platformFee || 0), 0);

  const activeDisputes = transactions
    .filter((t: Transaction) => t.status === "cancelled").length;

  const currency = transactions[0]?.currency || "USD";
  const fmt = (n: number) => `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statValues = [fmt(totalRevenue), fmt(pendingPayouts), fmt(platformCommissions), String(activeDisputes)];

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_META.map((s, i) => {
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
                <p className="text-2xl font-bold" style={{ color: "#2C2E33" }}>{statValues[i]}</p>
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
          <div className="px-6 pt-3 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>Recent Transactions</h2>
            <MarkAllSeenButton count={newCount} onClick={() => dismissAll()} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#F2F2F2" }}>
                  <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>
                    Customer / Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Transaction ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Type / Method
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Reference
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t: Transaction) => (
                    <TableRow
                      key={t._id}
                      style={{ borderColor: "#F2F2F2" }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          {isNew(t._id) && <NewPulseDot />}
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                              {t.user?.firstName} {t.user?.lastName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {t.createdAt ? format(new Date(t.createdAt), "MMM dd, yyyy") : "N/A"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-medium truncate max-w-[120px] block" style={{ color: "#2C2E33" }} title={t._id}>
                          {t._id}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm capitalize" style={{ color: "#2C2E33" }}>{t.type}</span>
                          <span className="text-xs text-gray-400 capitalize">{t.paymentMethod}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-bold" style={{ color: "#2C2E33" }}>
                          {t.currency} {t.amount?.toLocaleString() || 0}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm" style={{ color: "#2C2E33" }}>
                          {t.reference?.type || "N/A"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={t.status} />
                      </TableCell>

                      <TableCell className="text-center">
                        <button
                          onClick={() => { handleViewDetails(t); dismiss(t._id); }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-[#F1913D]"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
                {TOTAL === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}
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

              {PAGES.map((p, i) => (
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
              ))}

              <button
                onClick={() => setPage((p) => Math.min(LAST_PG, p + 1))}
                disabled={page === LAST_PG || LAST_PG === 0}
                className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: "#2C2E33" }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </Card>
      </motion.div>

      {/* ── Details Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTxn && (
            <div className="space-y-6 py-4">
              {/* Top Summary */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Amount</p>
                  <p className="text-2xl font-bold text-[#F1913D]">{selectedTxn.currency} {selectedTxn.amount?.toLocaleString() || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                  <StatusBadge status={selectedTxn.status} />
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Transaction Information</p>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Transaction ID</span>
                        <span className="text-sm font-medium">{selectedTxn._id}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Date</span>
                        <span className="text-sm font-medium">{selectedTxn.createdAt ? format(new Date(selectedTxn.createdAt), "PPP p") : "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Type</span>
                        <span className="text-sm font-medium capitalize">{selectedTxn.type}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Payment Method</span>
                        <span className="text-sm font-medium capitalize">{selectedTxn.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Customer Details</p>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="text-sm font-medium">{selectedTxn.user?.firstName} {selectedTxn.user?.lastName}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm font-medium">{selectedTxn.user?.email}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">User ID</span>
                        <span className="text-sm font-medium">{selectedTxn.user?.uid}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference details if Reservation */}
              {selectedTxn.reference?.type === "Reservation" && selectedTxn.reference.id?.pricing && (
                <div className="bg-[#FEF0E4]/30 p-4 rounded-xl border border-[#F1913D]/20">
                  <p className="text-sm font-bold text-[#F1913D] mb-3">Reservation Pricing Details</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block">Base Price</span>
                      <span className="text-sm font-bold">{selectedTxn.reference.id.pricing.currency} {selectedTxn.reference.id.pricing.pricePerUnit}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Units/Nights</span>
                      <span className="text-sm font-bold">{selectedTxn.reference.id.pricing.units}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Service Fee</span>
                      <span className="text-sm font-bold">{selectedTxn.reference.id.pricing.currency} {selectedTxn.reference.id.pricing.serviceFee}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Total</span>
                      <span className="text-sm font-bold">{selectedTxn.reference.id.pricing.currency} {selectedTxn.reference.id.pricing.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
