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
import { useGetTransportationQuery } from "@/features/transportation/transportationApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import MarkAllSeenButton from "@/components/notifications/MarkAllSeenButton";
import NewPulseDot from "@/components/notifications/NewPulseDot";
import { format } from "date-fns";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Plane,
  Users,
} from "lucide-react";
import { useState } from "react";

/* ── Status badge ────────────────────────────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase();
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: "#E8F5E9", color: "#2B9724", label: "Completed" },
    confirmed: { bg: "#E3F2FD", color: "#1976D2", label: "Confirmed" },
    pending: { bg: "#FEF0E4", color: "#F1913D", label: "Pending" },
    cancelled: { bg: "#FEE2E2", color: "#DC3545", label: "Cancelled" },
  };
  const style = map[s as keyof typeof map] ?? { bg: "#F9FAFB", color: "#6C757D", label: status || "Unknown" };
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
}

/* ── Service type badge ──────────────────────────────────────── */
function ServiceBadge({ type }: { type?: string }) {
  const label = type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border"
      style={{ borderColor: "#E5E7EB", color: "#6C757D", backgroundColor: "#F9FAFB" }}>
      {label}
    </span>
  );
}

interface RideCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

interface RideLocation {
  address?: string;
}

interface RidePricing {
  currency?: string;
  amount?: number;
}

interface Ride {
  _id: string;
  uid?: string;
  customer?: RideCustomer;
  pickup?: RideLocation;
  dropoff?: RideLocation;
  serviceType?: string;
  vehicleType?: string;
  passengers?: number;
  luggage?: number;
  pickupAt?: string;
  status?: string;
  flightNumber?: string;
  pricing?: RidePricing;
  createdAt?: string;
  passengerName?: string;
}

/* ── Main component ──────────────────────────────────────────── */
export default function TransportationManagement() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Ride | null>(null);

  const { data: rideData, isLoading, isError } = useGetTransportationQuery({ page }, { pollingInterval: 3000 });
  useMarkPageSeen("transportation", rideData?.pagination?.total);
  const { isNew, dismiss, dismissAll } = useNewItemsTracker(
    "transportation",
    (rideData?.data || []).map((r: Ride) => r._id)
  );

  const rides = rideData?.data || [];
  const newCount = rides.filter((r: Ride) => isNew(r._id)).length;
  const pagination = rideData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load rides</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  return (
    <div className="space-y-6">

      {/* ── Table card ── */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            All Ride Requests
            <span className="ml-2 text-sm font-normal" style={{ color: "#6C757D" }}>({TOTAL})</span>
          </h2>
          <MarkAllSeenButton count={newCount} onClick={() => dismissAll()} />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Customer</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Route</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Service / Vehicle</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Passengers</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Pickup At</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">No rides found</TableCell>
                </TableRow>
              ) : (
                rides.map((ride: Ride) => (
                  <TableRow key={ride._id} style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors">

                    {/* Customer */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        {isNew(ride._id) && <NewPulseDot />}
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{ride.customer?.name}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{ride.customer?.email}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{ride.customer?.phone}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Route */}
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-[200px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                          <p className="text-xs line-clamp-1" style={{ color: "#2C2E33" }}>{ride.pickup?.address}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-gray-300" />
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#F1913D" }} />
                          <p className="text-xs line-clamp-1" style={{ color: "#2C2E33" }}>{ride.dropoff?.address}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Service / Vehicle */}
                    <TableCell>
                      <ServiceBadge type={ride.serviceType} />
                      <p className="text-xs mt-1 capitalize" style={{ color: "#6C757D" }}>
                        {ride.vehicleType?.replace(/_/g, " ")}
                      </p>
                    </TableCell>

                    {/* Passengers */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" style={{ color: "#6C757D" }} />
                        <span className="text-sm font-medium" style={{ color: "#2C2E33" }}>{ride.passengers}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#6C757D" }}>Luggage: {ride.luggage}</p>
                    </TableCell>

                    {/* Pickup At */}
                    <TableCell>
                      <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>
                        {ride.pickupAt ? format(new Date(ride.pickupAt), "MMM dd, yyyy") : "—"}
                      </p>
                      <p className="text-xs" style={{ color: "#6C757D" }}>
                        {ride.pickupAt ? format(new Date(ride.pickupAt), "hh:mm a") : ""}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={ride.status} />
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => { setSelected(ride); dismiss(ride._id); }}
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
              Ride Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 pt-1">

              {/* Header strip */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6C757D" }}>Ride ID</p>
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>{selected.uid || selected._id}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {/* Route */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Route</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <div className="w-0.5 h-6 bg-gray-200" />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F1913D" }} />
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#6C757D" }}>Pickup</p>
                        <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>{selected.pickup?.address}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#6C757D" }}>Dropoff</p>
                        <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>{selected.dropoff?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ride details grid */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Ride Information</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Service Type", value: selected.serviceType?.replace(/_/g, " ") },
                    { label: "Vehicle Type", value: selected.vehicleType?.replace(/_/g, " ") },
                    { label: "Passenger Name", value: selected.passengerName },
                    { label: "Passengers", value: String(selected.passengers) },
                    { label: "Luggage", value: String(selected.luggage) },
                    { label: "Pickup At", value: selected.pickupAt ? format(new Date(selected.pickupAt), "PPP p") : "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs" style={{ color: "#6C757D" }}>{label}</p>
                      <p className="text-sm font-medium capitalize" style={{ color: "#2C2E33" }}>{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flight */}
              {selected.flightNumber && (
                <div className="rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: "#F2F2F2" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#E3F2FD" }}>
                    <Plane className="w-4 h-4" style={{ color: "#1976D2" }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#6C757D" }}>Flight Number</p>
                    <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>{selected.flightNumber}</p>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: "#F2F2F2" }}>
                <div>
                  <p className="text-xs" style={{ color: "#6C757D" }}>Amount</p>
                  <p className="text-xl font-bold" style={{ color: "#F1913D" }}>
                    {selected.pricing?.currency} {selected.pricing?.amount?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#6C757D" }}>Booked On</p>
                  <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>
                    {selected.createdAt ? format(new Date(selected.createdAt), "PPP") : "—"}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2" }}>
                <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Customer</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Name", value: selected.customer?.name },
                    { label: "Email", value: selected.customer?.email },
                    { label: "Phone", value: selected.customer?.phone },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs" style={{ color: "#6C757D" }}>{label}</p>
                      <p className="text-sm font-medium break-all" style={{ color: "#2C2E33" }}>{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
