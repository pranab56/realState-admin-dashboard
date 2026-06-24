"use client";

import MarkAllSeenButton from "@/components/notifications/MarkAllSeenButton";
import NewPulseDot from "@/components/notifications/NewPulseDot";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPoaQuery } from "@/features/poa/poaApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import { format } from "date-fns";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { useState } from "react";

/* ── Types ─────────────────────────────────────────────────── */
interface Consultation {
  _id: string;
  uid?: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  assignedConsultant?: string;
  scheduledAt?: string;
}

/* ── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "#FEF0E4", color: "#F1913D", label: "Pending" },
    in_review: { bg: "#E3F2FD", color: "#1976D2", label: "In Review" },
    resolved: { bg: "#E8F5E9", color: "#2B9724", label: "Resolved" },
    cancelled: { bg: "#FEE2E2", color: "#DC3545", label: "Cancelled" },
    closed: { bg: "#E8F5E9", color: "#2B9724", label: "Closed" },
  };

  const style = map[s] ?? { bg: "#F9FAFB", color: "#6C757D", label: status };
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

/* ── Type badge ───────────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const isPoa = type?.toLowerCase() === "poa";
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
      style={{
        backgroundColor: isPoa ? "#F0EDFF" : "#FEF0E4",
        color: isPoa ? "#6C5CE7" : "#F1913D",
      }}
    >
      {isPoa ? "POA" : "Legal"}
    </span>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function PoaManagement() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Consultation | null>(null);

  const { data: poaData, isLoading, isError } = useGetPoaQuery({ page }, { pollingInterval: 3000 });
  useMarkPageSeen("poa", poaData?.pagination?.total);
  const { isNew, dismiss, dismissAll } = useNewItemsTracker(
    "poa",
    (poaData?.data || []).map((c: Consultation) => c._id)
  );

  const consultations: Consultation[] = poaData?.data || [];
  const newCount = consultations.filter((c) => isNew(c._id)).length;
  const pagination = poaData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load consultations</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  return (
    <div className="space-y-6">

      {/* ── Table Card ── */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            All Consultations
            <span className="ml-2 text-sm font-normal" style={{ color: "#6C757D" }}>({TOTAL})</span>
          </h2>
          <MarkAllSeenButton count={newCount} onClick={() => dismissAll()} />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Customer</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Type</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Message</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Date</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {consultations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No consultations found
                  </TableCell>
                </TableRow>
              ) : (
                consultations.map((item: Consultation) => (
                  <TableRow
                    key={item._id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Customer */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        {isNew(item._id) && <NewPulseDot />}
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                            {item.customer?.name}
                          </p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{item.customer?.email}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{item.customer?.phone}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <TypeBadge type={item.type} />
                    </TableCell>

                    {/* Message */}
                    <TableCell>
                      <p className="text-sm line-clamp-2 max-w-[220px]" style={{ color: "#2C2E33" }}>
                        {item.message}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <p className="text-sm" style={{ color: "#2C2E33" }}>
                        {item.createdAt ? format(new Date(item.createdAt), "MMM dd, yyyy") : "—"}
                      </p>
                      <p className="text-xs" style={{ color: "#6C757D" }}>
                        {item.uid || ""}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => { setSelected(item); dismiss(item._id); }}
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        style={{ color: "#F1913D" }}
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
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#F2F2F2" }}>
          <p className="text-sm" style={{ color: "#6C757D" }}>
            Showing{" "}
            <span className="font-semibold" style={{ color: "#2C2E33" }}>
              {TOTAL === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}
            </span>{" "}
            of <span className="font-semibold" style={{ color: "#2C2E33" }}>{TOTAL}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {PAGES.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 text-sm rounded-lg font-medium transition-colors cursor-pointer"
                style={page === p ? { backgroundColor: "#F1913D", color: "#FFFFFF" } : { color: "#2C2E33" }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(LAST_PG, p + 1))}
              disabled={page === LAST_PG || LAST_PG === 0}
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* ── Detail Modal ── */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ color: "#2C2E33" }}>
              Consultation Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 pt-1">

              {/* Header strip */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6C757D" }}>
                    Consultation ID
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>
                    {selected.uid || selected._id}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <TypeBadge type={selected.type} />
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* Customer */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Customer Information</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Name", value: selected.customer?.name },
                    { label: "Email", value: selected.customer?.email },
                    { label: "Phone", value: selected.customer?.phone },
                    {
                      label: "Submitted",
                      value: selected.createdAt
                        ? format(new Date(selected.createdAt), "PPP p")
                        : "—",
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs" style={{ color: "#6C757D" }}>{label}</p>
                      <p className="text-sm font-medium break-all" style={{ color: "#2C2E33" }}>
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#F2F2F2" }}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" style={{ color: "#F1913D" }} />
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Message</p>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#2C2E33" }}>
                  {selected.message}
                </p>
              </div>

              {/* Consultant & Schedule */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assigned Consultant */}
                <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#F2F2F2" }}>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" style={{ color: "#F1913D" }} />
                    <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Consultant</p>
                  </div>
                  {selected.assignedConsultant ? (
                    <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>
                      {selected.assignedConsultant}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: "#9CA3AF" }}>Not yet assigned</p>
                  )}
                </div>

                {/* Scheduled At */}
                <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#F2F2F2" }}>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" style={{ color: "#F1913D" }} />
                    <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Scheduled At</p>
                  </div>
                  {selected.scheduledAt ? (
                    <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>
                      {format(new Date(selected.scheduledAt), "PPP p")}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: "#9CA3AF" }}>Not yet scheduled</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
