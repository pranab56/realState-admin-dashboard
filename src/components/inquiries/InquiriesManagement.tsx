"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetInquiriesQuery } from "@/features/inquiries/inquiriesApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import MarkAllSeenButton from "@/components/notifications/MarkAllSeenButton";
import NewPulseDot from "@/components/notifications/NewPulseDot";
import { format } from "date-fns";
import { BadgeCheck, ChevronLeft, ChevronRight, Eye, MapPin, MessageSquare, XCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { baseURL } from "@/utils/BaseURL";

/* ── Types ─────────────────────────────────────────────────── */
interface Inquiry {
  _id: string;
  uid?: string;
  message: string;
  status: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  property?: {
    title: string;
    images: string[];
    structureType: string;
    category: string;
    price: number;
    currency: string;
    status: string;
    isVerified: boolean;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    amenities?: string[];
  };
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "resolved" || s === "closed")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  if (s === "pending")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#FEF0E4", color: "#F1913D" }}>
        Pending
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ borderColor: "#D1D5DB", color: "#6C757D", backgroundColor: "#F9FAFB" }}>
      {status}
    </span>
  );
}

export default function InquiriesManagement() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const { data: inquiriesData, isLoading, isError } = useGetInquiriesQuery({ page }, { pollingInterval: 3000 });
  useMarkPageSeen("inquiries", inquiriesData?.pagination?.total);
  const { isNew, dismiss, dismissAll } = useNewItemsTracker(
    "inquiries",
    (inquiriesData?.data || []).map((i: Inquiry) => i._id)
  );

  const inquiries: Inquiry[] = inquiriesData?.data || [];
  const newCount = inquiries.filter((i) => isNew(i._id)).length;
  const pagination = inquiriesData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load inquiries</div>;

  const TOTAL    = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG  = pagination.totalPage;
  const PAGES    = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  return (
    <div className="space-y-6">

      {/* ── Table Card ── */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            All Inquiries
            <span className="ml-2 text-sm font-normal" style={{ color: "#6C757D" }}>({TOTAL})</span>
          </h2>
          <MarkAllSeenButton count={newCount} onClick={() => dismissAll()} />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Customer</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Property</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Message</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Date</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No inquiries found
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((inq: Inquiry) => (
                  <TableRow
                    key={inq._id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Customer */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        {isNew(inq._id) && <NewPulseDot />}
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                            {inq.customer?.name}
                          </p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{inq.customer?.email}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{inq.customer?.phone}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Property */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {inq.property?.images?.[0] ? (
                            <Image
                              src={`${baseURL}${inq.property.images[0]}`}
                              alt={inq.property.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold line-clamp-1 max-w-[160px]" style={{ color: "#2C2E33" }}>
                            {inq.property?.title}
                          </p>
                          <p className="text-xs capitalize" style={{ color: "#6C757D" }}>
                            {inq.property?.structureType} · {inq.property?.category}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Message */}
                    <TableCell>
                      <p className="text-sm line-clamp-2 max-w-[200px]" style={{ color: "#2C2E33" }}>
                        {inq.message}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <p className="text-sm" style={{ color: "#2C2E33" }}>
                        {inq.createdAt ? format(new Date(inq.createdAt), "MMM dd, yyyy") : "—"}
                      </p>
                      <p className="text-xs" style={{ color: "#6C757D" }}>
                        {inq.uid || ""}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={inq.status} />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => { setSelected(inq); dismiss(inq._id); }}
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
              Inquiry Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 pt-1">

              {/* Header strip */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6C757D" }}>Inquiry ID</p>
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>{selected.uid || selected._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#6C757D" }}>Status</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* Customer */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Customer Information</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Name",  value: selected.customer?.name },
                    { label: "Email", value: selected.customer?.email },
                    { label: "Phone", value: selected.customer?.phone },
                    { label: "Date",  value: selected.createdAt ? format(new Date(selected.createdAt), "PPP p") : "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs" style={{ color: "#6C757D" }}>{label}</p>
                      <p className="text-sm font-medium break-all" style={{ color: "#2C2E33" }}>{value || "—"}</p>
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
                <p className="text-sm leading-relaxed" style={{ color: "#2C2E33" }}>{selected.message}</p>
              </div>

              {/* Property */}
              {selected.property && (
                <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Property Details</p>

                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {selected.property.images?.[0] ? (
                        <Image
                          src={`${baseURL}${selected.property.images[0]}`}
                          alt={selected.property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{selected.property.title}</p>
                      <p className="text-xs capitalize mt-0.5" style={{ color: "#6C757D" }}>
                        {selected.property.structureType} · {selected.property.category}
                      </p>
                      <p className="text-xs font-semibold mt-1" style={{ color: "#F1913D" }}>
                        {selected.property.currency} {selected.property.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-xs" style={{ color: "#6C757D" }}>Status</p>
                      <StatusBadge status={selected.property.status} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#6C757D" }}>Verification</p>
                      {selected.property.isVerified ? (
                        <span className="flex items-center gap-1 text-sm font-semibold mt-1" style={{ color: "#2B9724" }}>
                          <BadgeCheck className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm font-semibold mt-1 text-gray-400">
                          <XCircle className="w-4 h-4" /> Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#F1913D" }} />
                    <p className="text-xs" style={{ color: "#6C757D" }}>
                      {[
                        selected.property.address?.street,
                        selected.property.address?.city,
                        selected.property.address?.state,
                        selected.property.address?.country,
                      ].filter(Boolean).join(", ")}
                    </p>
                  </div>

                  {selected.property.amenities && selected.property.amenities.length > 0 && (
                    <div>
                      <p className="text-xs mb-1.5" style={{ color: "#6C757D" }}>Amenities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.property.amenities.map((a: string) => (
                          <span key={a} className="text-xs px-2 py-0.5 rounded-full border"
                            style={{ borderColor: "#F2F2F2", color: "#6C757D", backgroundColor: "#FAFAFA" }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
