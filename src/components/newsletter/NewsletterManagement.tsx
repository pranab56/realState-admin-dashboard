"use client";

import NewPulseDot from "@/components/notifications/NewPulseDot";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetNewsLetterQuery } from "@/features/newsletter/newsletterApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useState } from "react";

/* ── Types ─────────────────────────────────────────────────── */
interface NewsletterSubscriber {
  _id: string;
  email: string;
  source: string;
  status: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "subscribed")
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}
      >
        Subscribed
      </span>
    );
  if (s === "unsubscribed")
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#FCE8E8", color: "#E54848" }}
      >
        Unsubscribed
      </span>
    );
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ borderColor: "#D1D5DB", color: "#6C757D", backgroundColor: "#F9FAFB" }}
    >
      {status}
    </span>
  );
}

export default function NewsletterManagement() {
  const [page, setPage] = useState(1);

  const { data: newsletterData, isLoading, isError } = useGetNewsLetterQuery({ page }, { pollingInterval: 3000 });
  useMarkPageSeen("newsletter", newsletterData?.pagination?.total);
  const { isNew, dismiss } = useNewItemsTracker(
    "newsletter",
    (newsletterData?.data || []).map((s: NewsletterSubscriber) => s._id)
  );

  const subscribers: NewsletterSubscriber[] = newsletterData?.data || [];
  const pagination = newsletterData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load newsletter subscriptions</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            Newsletter Subscribers
            <span className="ml-2 text-sm font-normal" style={{ color: "#6C757D" }}>
              ({TOTAL})
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Source
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Subscribed At
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Unsubscribed At
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    No newsletter subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((sub) => (
                  <TableRow
                    key={sub._id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => dismiss(sub._id)}
                  >
                    {/* Email */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2.5">
                        {isNew(sub._id) && <NewPulseDot />}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "#FEF0E4" }}
                        >
                          <Mail className="w-4 h-4" style={{ color: "#F1913D" }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                          {sub.email}
                        </p>
                      </div>
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      <p className="text-sm capitalize" style={{ color: "#2C2E33" }}>
                        {sub.source || "—"}
                      </p>
                    </TableCell>

                    {/* Subscribed At */}
                    <TableCell>
                      <p className="text-sm" style={{ color: "#2C2E33" }}>
                        {sub.subscribedAt ? format(new Date(sub.subscribedAt), "MMM dd, yyyy") : "—"}
                      </p>
                      <p className="text-xs" style={{ color: "#6C757D" }}>
                        {sub.subscribedAt ? format(new Date(sub.subscribedAt), "hh:mm a") : ""}
                      </p>
                    </TableCell>

                    {/* Unsubscribed At */}
                    <TableCell>
                      {sub.unsubscribedAt ? (
                        <>
                          <p className="text-sm" style={{ color: "#2C2E33" }}>
                            {format(new Date(sub.unsubscribedAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>
                            {format(new Date(sub.unsubscribedAt), "hh:mm a")}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm" style={{ color: "#6C757D" }}>
                          —
                        </p>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={sub.status} />
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
    </div>
  );
}
