"use client";

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
import { useGetReviewsQuery } from "@/features/review/reviewApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import MarkAllSeenButton from "@/components/notifications/MarkAllSeenButton";
import NewPulseDot from "@/components/notifications/NewPulseDot";
import { baseURL } from "@/utils/BaseURL";
import { format } from "date-fns";
import { BadgeCheck, ChevronLeft, ChevronRight, Eye, MapPin, Star, XCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/* ── Star Rating ──────────────────────────────────────────────── */
function StarRating({ rating, size = 14 }: { rating?: number; size?: number }) {
  const safeRating = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: size, height: size }}
          className={s <= safeRating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

/* ── Verified badge ───────────────────────────────────────────── */
function VerifiedBadge({ verified }: { verified?: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
      <BadgeCheck className="w-3.5 h-3.5" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: "#F9FAFB", color: "#6C757D", border: "1px solid #E5E7EB" }}>
      <XCircle className="w-3.5 h-3.5" /> Unverified
    </span>
  );
}

/* ── Customer avatar ─────────────────────────────────────────── */
function Avatar({ src, name }: { src?: string; name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (src) {
    return (
      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
        <Image src={`${baseURL}${src}`} alt={name} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
      style={{ backgroundColor: "#FEF0E4", color: "#F1913D" }}>
      {initials}
    </div>
  );
}

interface ReviewCustomer {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
  uid?: string;
  role?: string;
  status?: string;
  isVerified?: boolean;
}

interface ReviewProperty {
  title?: string;
  structureType?: string;
  category?: string;
  price?: number;
  currency?: string;
  images?: string[];
  averageRating?: number;
  ratingCount?: number;
  isVerified?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface Review {
  _id: string;
  customer?: ReviewCustomer;
  property?: ReviewProperty;
  rating?: number;
  comment?: string;
  createdAt?: string;
  isVerified?: boolean;
}

/* ── Main component ──────────────────────────────────────────── */
export default function ReviewManagement() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Review | null>(null);

  const { data: reviewData, isLoading, isError } = useGetReviewsQuery({ page }, { pollingInterval: 3000 });
  useMarkPageSeen("review", reviewData?.pagination?.total);
  const { isNew, dismiss, dismissAll } = useNewItemsTracker(
    "review",
    (reviewData?.data || []).map((r: Review) => r._id)
  );

  const reviews = reviewData?.data || [];
  const newCount = reviews.filter((r: Review) => isNew(r._id)).length;
  const pagination = reviewData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load reviews</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  /* average rating across current page */
  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: Review) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: String(TOTAL) },
          { label: "Average Rating", value: `${avgRating} / 5` },
          { label: "Verified Reviews", value: String(reviews.filter((r: Review) => r.isVerified).length) },
        ].map((s) => (
          <Card key={s.label} className="px-5 py-4 border-none shadow-sm bg-white flex flex-col gap-1">
            <p className="text-sm font-medium" style={{ color: "#6C757D" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: "#2C2E33" }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* ── Table ── */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            All Reviews
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
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Rating</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Comment</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Date</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Verified</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">No reviews found</TableCell>
                </TableRow>
              ) : (
                reviews.map((rev: Review) => {
                  const fullName = `${rev.customer?.firstName ?? ""} ${rev.customer?.lastName ?? ""}`.trim();
                  return (
                    <TableRow key={rev._id} style={{ borderColor: "#F2F2F2" }}
                      className="hover:bg-gray-50/60 transition-colors">

                      {/* Customer */}
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2.5">
                          {isNew(rev._id) && <NewPulseDot />}
                          <Avatar src={rev.customer?.image} name={fullName || "?"} />
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{fullName || "—"}</p>
                            <p className="text-xs" style={{ color: "#6C757D" }}>{rev.customer?.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Property */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            {rev.property?.images?.[0] ? (
                              <Image src={`${baseURL}${rev.property.images[0]}`}
                                alt={rev.property.title || "Property"} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">No Img</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold line-clamp-1 max-w-[150px]" style={{ color: "#2C2E33" }}>
                              {rev.property?.title}
                            </p>
                            <p className="text-xs capitalize" style={{ color: "#6C757D" }}>
                              {rev.property?.structureType}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Rating */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <StarRating rating={rev.rating} />
                          <span className="text-xs font-semibold" style={{ color: "#2C2E33" }}>{rev.rating} / 5</span>
                        </div>
                      </TableCell>

                      {/* Comment */}
                      <TableCell>
                        <p className="text-sm line-clamp-2 max-w-[200px]" style={{ color: "#2C2E33" }}>
                          {rev.comment}
                        </p>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <p className="text-sm" style={{ color: "#2C2E33" }}>
                          {rev.createdAt ? format(new Date(rev.createdAt), "MMM dd, yyyy") : "—"}
                        </p>
                      </TableCell>

                      {/* Verified */}
                      <TableCell>
                        <VerifiedBadge verified={rev.isVerified} />
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-center">
                        <button
                          onClick={() => { setSelected(rev); dismiss(rev._id); }}
                          className="p-2 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                          style={{ color: "#F1913D" }}
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
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
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {PAGES.map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 text-sm rounded-lg font-medium transition-colors cursor-pointer"
                style={page === p ? { backgroundColor: "#F1913D", color: "#FFFFFF" } : { color: "#2C2E33" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(LAST_PG, p + 1))}
              disabled={page === LAST_PG || LAST_PG === 0}
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}>
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
              Review Details
            </DialogTitle>
          </DialogHeader>

          {selected && (() => {
            const fullName = `${selected.customer?.firstName ?? ""} ${selected.customer?.lastName ?? ""}`.trim();
            return (
              <div className="space-y-5 pt-1">

                {/* Rating hero */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <StarRating rating={selected.rating} size={20} />
                    <p className="text-2xl font-bold mt-1" style={{ color: "#2C2E33" }}>
                      {selected.rating ?? 0} <span className="text-base font-normal text-gray-400">/ 5</span>
                    </p>
                  </div>
                  <VerifiedBadge verified={selected.isVerified} />
                </div>

                {/* Comment */}
                <div className="rounded-xl border p-4" style={{ borderColor: "#F2F2F2" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6C757D" }}>Comment</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#2C2E33" }}>{selected.comment}</p>
                  <p className="text-xs mt-3" style={{ color: "#6C757D" }}>
                    Posted on {selected.createdAt ? format(new Date(selected.createdAt), "PPP") : "—"}
                  </p>
                </div>

                {/* Customer */}
                <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Customer</p>
                  <div className="flex items-center gap-3">
                    <Avatar src={selected.customer?.image} name={fullName || "?"} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{fullName || "—"}</p>
                      <p className="text-xs" style={{ color: "#6C757D" }}>{selected.customer?.email}</p>
                      {selected.customer?.phone && (
                        <p className="text-xs" style={{ color: "#6C757D" }}>{selected.customer.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {[
                      { label: "User ID", value: selected.customer?.uid },
                      { label: "Role", value: selected.customer?.role },
                      { label: "Status", value: selected.customer?.status },
                      { label: "Verified", value: selected.customer?.isVerified ? "Yes" : "No" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs" style={{ color: "#6C757D" }}>{label}</p>
                        <p className="text-sm font-medium capitalize" style={{ color: "#2C2E33" }}>{value ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property */}
                {selected.property && (
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                    <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Property</p>
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {selected.property.images?.[0] ? (
                          <Image src={`${baseURL}${selected.property.images[0]}`}
                            alt={selected.property.title || "Property"} fill className="object-cover" />
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs" style={{ color: "#6C757D" }}>Avg Rating</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarRating rating={Math.round(selected.property.averageRating ?? 0)} size={13} />
                          <span className="text-xs font-medium" style={{ color: "#2C2E33" }}>
                            {selected.property.averageRating ?? "—"} ({selected.property.ratingCount ?? 0})
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "#6C757D" }}>Verification</p>
                        <VerifiedBadge verified={selected.property.isVerified} />
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
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
                  </div>
                )}

              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
