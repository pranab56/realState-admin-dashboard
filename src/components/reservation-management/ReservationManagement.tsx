"use client";

import DeleteConfirmationDialog from "@/components/confirmation/deleteConfirmationDialog";
import MarkAllSeenButton from "@/components/notifications/MarkAllSeenButton";
import NewPulseDot from "@/components/notifications/NewPulseDot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteReservationMutation,
  useGetReservationQuery,
  useUpdateReservationMutation,
} from "@/features/reservation/reservationApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import { baseURL } from "@/utils/BaseURL";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Eye, Loader2, MapPin, Pencil, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

/* ── Types ─────────────────────────────────────────────────── */
type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface ReservationCustomer {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
  uid?: string;
}

interface ReservationProperty {
  _id: string;
  title?: string;
  structureType?: string;
  category?: string;
  images?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface ReservationTransaction {
  gateway?: string;
  gatewayReferenceId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentMethod?: string;
  platformFee?: number;
  netAmount?: number;
  paidAt?: string;
}

interface Reservation {
  _id: string;
  uid?: string;
  guests: { adults: number; children: number; pets: number };
  pricing: {
    pricePerUnit: number;
    units: number;
    subtotal: number;
    serviceFee: number;
    total: number;
    discount: number;
    currency: string;
    isPaid: boolean;
  };
  property?: ReservationProperty;
  customer?: ReservationCustomer;
  checkIn: string;
  checkOut: string;
  roomClass: string;
  status: ReservationStatus;
  createdAt: string;
  transaction?: ReservationTransaction;
}

const STATUS_OPTIONS: ReservationStatus[] = ["pending", "confirmed", "cancelled", "completed"];

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const map: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#FEF0E4", color: "#F1913D" },
    confirmed: { bg: "#E8F0FE", color: "#3B82F6" },
    completed: { bg: "#E8F5E9", color: "#2B9724" },
    cancelled: { bg: "#FCE8E8", color: "#E54848" },
  };
  const { bg, color } = map[s] || { bg: "#F9FAFB", color: "#6C757D" };
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: bg, color }}
    >
      {s}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function ReservationManagement() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [editStatus, setEditStatus] = useState<ReservationStatus>("pending");
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);

  const { data: reservationData, isLoading, isError } = useGetReservationQuery({ page }, { pollingInterval: 3000 });
  useMarkPageSeen("reservation", reservationData?.pagination?.total);
  const { isNew, dismiss, dismissAll } = useNewItemsTracker(
    "reservation",
    (reservationData?.data || []).map((r: Reservation) => r._id)
  );
  const [updateReservation, { isLoading: isUpdating }] = useUpdateReservationMutation();
  const [deleteReservation, { isLoading: isDeleting }] = useDeleteReservationMutation();

  const reservations: Reservation[] = reservationData?.data || [];
  const newCount = reservations.filter((r: Reservation) => isNew(r._id)).length;
  const pagination = reservationData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load reservations</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  const openEdit = (res: Reservation) => {
    setEditTarget(res);
    setEditStatus(res.status);
  };

  const handleUpdateStatus = async () => {
    if (!editTarget) return;
    try {
      await updateReservation({ reservationId: editTarget._id, data: { status: editStatus } }).unwrap();
      toast.success("Reservation status updated successfully!");
      setEditTarget(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update reservation");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReservation(deleteTarget._id).unwrap();
      toast.success("Reservation deleted successfully!");
      setDeleteTarget(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete reservation");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Table Card ── */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            All Reservations
            <span className="ml-2 text-sm font-normal" style={{ color: "#6C757D" }}>({TOTAL})</span>
          </h2>
          <MarkAllSeenButton count={newCount} onClick={() => dismissAll()} />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Reservation</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Customer</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Property</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Check-in / Check-out</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Total</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    No reservations found
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => {
                  const fullName = `${res.customer?.firstName ?? ""} ${res.customer?.lastName ?? ""}`.trim();
                  return (
                    <TableRow
                      key={res._id}
                      style={{ borderColor: "#F2F2F2" }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Reservation */}
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          {isNew(res._id) && <NewPulseDot />}
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{res.uid}</p>
                            <p className="text-xs capitalize" style={{ color: "#6C757D" }}>{res.roomClass?.replace(/_/g, " ")}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{fullName || "—"}</p>
                        <p className="text-xs" style={{ color: "#6C757D" }}>{res.customer?.email}</p>
                      </TableCell>

                      {/* Property */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            {res.property?.images?.[0] ? (
                              <Image
                                src={`${baseURL}${res.property.images[0]}`}
                                alt={res.property.title || "Property"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">No Img</div>
                            )}
                          </div>
                          <p className="text-sm font-semibold line-clamp-1 max-w-[140px]" style={{ color: "#2C2E33" }}>
                            {res.property?.title}
                          </p>
                        </div>
                      </TableCell>

                      {/* Dates */}
                      <TableCell>
                        <p className="text-sm" style={{ color: "#2C2E33" }}>
                          {res.checkIn ? format(new Date(res.checkIn), "MMM dd, yyyy") : "—"}
                        </p>
                        <p className="text-xs" style={{ color: "#6C757D" }}>
                          to {res.checkOut ? format(new Date(res.checkOut), "MMM dd, yyyy") : "—"}
                        </p>
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                          {res.pricing?.currency} {res.pricing?.total?.toFixed(2)}
                        </p>
                        <p className="text-xs" style={{ color: res.pricing?.isPaid ? "#2B9724" : "#E54848" }}>
                          {res.pricing?.isPaid ? "Paid" : "Unpaid"}
                        </p>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={res.status} />
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setSelected(res); dismiss(res._id); }}
                            className="p-2 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            style={{ color: "#F1913D" }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(res)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            style={{ color: "#3B82F6" }}
                            title="Edit Status"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(res)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            style={{ color: "#E54848" }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              Reservation Details
            </DialogTitle>
          </DialogHeader>

          {selected && (() => {
            const fullName = `${selected.customer?.firstName ?? ""} ${selected.customer?.lastName ?? ""}`.trim();
            return (
              <div className="space-y-5 pt-1">
                {/* Header strip */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6C757D" }}>Reservation ID</p>
                    <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>{selected.uid || selected._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#6C757D" }}>Status</p>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                {/* Stay info */}
                <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Stay Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Check-in", value: selected.checkIn ? format(new Date(selected.checkIn), "PPP") : "—" },
                      { label: "Check-out", value: selected.checkOut ? format(new Date(selected.checkOut), "PPP") : "—" },
                      { label: "Room Class", value: selected.roomClass?.replace(/_/g, " ") },
                      {
                        label: "Guests",
                        value: `${selected.guests?.adults ?? 0} Adults, ${selected.guests?.children ?? 0} Children, ${selected.guests?.pets ?? 0} Pets`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs" style={{ color: "#6C757D" }}>{label}</p>
                        <p className="text-sm font-medium capitalize" style={{ color: "#2C2E33" }}>{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Customer</p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#6C757D" }}>
                    <Users className="w-4 h-4" />
                    <span style={{ color: "#2C2E33" }} className="font-medium">{fullName || "—"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs" style={{ color: "#6C757D" }}>Email</p>
                      <p className="text-sm font-medium break-all" style={{ color: "#2C2E33" }}>{selected.customer?.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#6C757D" }}>Phone</p>
                      <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>{selected.customer?.phone || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Property */}
                {selected.property && (
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                    <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Property</p>
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {selected.property.images?.[0] ? (
                          <Image
                            src={`${baseURL}${selected.property.images[0]}`}
                            alt={selected.property.title || "Property"}
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
                  </div>
                )}

                {/* Pricing */}
                <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#F2F2F2" }}>
                  <p className="text-sm font-bold mb-1" style={{ color: "#2C2E33" }}>Pricing</p>
                  {[
                    { label: `Price / unit × ${selected.pricing?.units}`, value: selected.pricing?.pricePerUnit },
                    { label: "Subtotal", value: selected.pricing?.subtotal },
                    { label: "Service Fee", value: selected.pricing?.serviceFee },
                    { label: "Discount", value: -(selected.pricing?.discount || 0) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span style={{ color: "#6C757D" }}>{label}</span>
                      <span style={{ color: "#2C2E33" }}>
                        {selected.pricing?.currency} {Number(value ?? 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: "#F2F2F2" }}>
                    <span style={{ color: "#2C2E33" }}>Total</span>
                    <span style={{ color: "#F1913D" }}>
                      {selected.pricing?.currency} {selected.pricing?.total?.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs pt-1" style={{ color: selected.pricing?.isPaid ? "#2B9724" : "#E54848" }}>
                    {selected.pricing?.isPaid ? "Payment received" : "Payment pending"}
                  </p>
                </div>

                {/* Transaction */}
                {selected.transaction && (
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                    <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Transaction</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Gateway", value: selected.transaction.gateway },
                        { label: "Payment Method", value: selected.transaction.paymentMethod },
                        { label: "Status", value: selected.transaction.status },
                        { label: "Paid At", value: selected.transaction.paidAt ? format(new Date(selected.transaction.paidAt), "PPP p") : "—" },
                        { label: "Platform Fee", value: `${selected.transaction.currency} ${selected.transaction.platformFee?.toFixed(2)}` },
                        { label: "Net Amount", value: `${selected.transaction.currency} ${selected.transaction.netAmount?.toFixed(2)}` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{label}</p>
                          <p className="text-sm font-medium capitalize" style={{ color: "#2C2E33" }}>{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Edit Status Modal ── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ color: "#2C2E33" }}>
              Update Reservation Status
            </DialogTitle>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-5 pt-1">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6C757D" }}>Reservation ID</p>
                <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>{editTarget.uid || editTarget._id}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ReservationStatus)}>
                  <SelectTrigger className="h-11 w-full rounded-sm py-5 border" style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTarget(null)}
                  className="h-11 px-6 rounded-sm font-semibold border"
                  style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="h-11 px-6 rounded-sm font-semibold text-white flex items-center gap-2"
                  style={{ backgroundColor: "#F1913D" }}
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <DeleteConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Reservation"
        itemName={deleteTarget?.uid}
        itemType="reservation"
        isLoading={isDeleting}
      />
    </div>
  );
}
