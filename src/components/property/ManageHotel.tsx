"use client";

import { Card } from "@/components/ui/card";
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
import { useGetManageHotelsQuery } from "@/features/manageProperty/managePropertyApi";
import { BadgeCheck, ChevronLeft, ChevronRight, MapPin, XCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CustomLoading } from "../../hooks/CustomLoading";

function StatusBadge({ status }: { status?: string }) {
  if (status === "active")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
        Active
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
        style={{ borderColor: "#F1913D", color: "#F1913D", backgroundColor: "#FEF0E4" }}>
        Pending
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ borderColor: "#D1D5DB", color: "#6C757D", backgroundColor: "#F9FAFB" }}>
      {status || "Unknown"}
    </span>
  );
}

const STRUCTURE_TYPES = ["apartment", "villa", "house", "penthouse", "office", "shop", "warehouse", "hotel", "resort"];

interface Hotel {
  _id: string;
  title: string;
  structureType: string;
  images?: string[];
  address?: { city?: string; country?: string };
  amenities?: string[];
  price?: number;
  currency?: string;
  status?: string;
  isVerified?: boolean;
}

export default function ManageHotel() {
  const [page, setPage] = useState(1);
  const [structureType, setStructureType] = useState("");
  const [status, setStatus] = useState("");
  const [isVerified, setIsVerified] = useState("");

  const params: Record<string, string | number> = { page, limit: 10 };
  if (structureType) params.structureType = structureType;
  if (status) params.status = status;
  if (isVerified !== "") params.isVerified = isVerified;

  const { data: hotelData, isLoading, isError } = useGetManageHotelsQuery(params);

  const hotels = hotelData?.data || [];
  const pagination = hotelData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load hotels</div>;

  const LAST_PAGE = pagination.totalPage;
  const PER_PAGE = pagination.limit;
  const TOTAL = pagination.total;
  const pages = Array.from({ length: LAST_PAGE }, (_, i) => i + 1);

  const handleFilterChange = (setter: (v: string) => void) => (val: string) => {
    setter(val === "all" ? "" : val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 border-none shadow-sm bg-white">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6C757D" }}>Structure Type</label>
            <Select onValueChange={handleFilterChange(setStructureType)} defaultValue="all">
              <SelectTrigger className="h-10 w-full text-sm rounded-lg border"
                style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {STRUCTURE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6C757D" }}>Status</label>
            <Select onValueChange={handleFilterChange(setStatus)} defaultValue="all">
              <SelectTrigger className="h-10 w-full text-sm rounded-lg border"
                style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6C757D" }}>Verification</label>
            <Select onValueChange={handleFilterChange(setIsVerified)} defaultValue="all">
              <SelectTrigger className="h-10 w-full text-sm rounded-lg border"
                style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>All Hotels & Accommodations</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Property Details</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Location</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Amenities</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Price / Night</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No hotels found
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel: Hotel) => (
                  <TableRow key={hotel._id} style={{ borderColor: "#F2F2F2" }} className="hover:bg-gray-50/60 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {hotel.images?.[0] ? (
                            <Image src={hotel.images[0]} alt={hotel.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold line-clamp-1" style={{ color: "#2C2E33" }}>{hotel.title}</p>
                          <p className="text-xs capitalize" style={{ color: "#6C757D" }}>{hotel.structureType}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#F1913D" }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>{hotel.address?.city}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{hotel.address?.country}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>
                        {hotel.amenities?.length ?? 0} amenities
                      </p>
                      <p className="text-xs line-clamp-1" style={{ color: "#6C757D" }}>
                        {hotel.amenities?.slice(0, 2).join(", ")}
                        {hotel.amenities?.length && hotel.amenities.length > 2 ? "..." : ""}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                        {hotel.price?.toLocaleString()} {hotel.currency}
                      </p>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={hotel.status} />
                    </TableCell>

                    <TableCell>
                      {hotel.isVerified ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#2B9724" }}>
                          <BadgeCheck className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                          <XCircle className="w-4 h-4" /> Unverified
                        </span>
                      )}
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
            {pages.map((p) => (
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
              onClick={() => setPage((p) => Math.min(LAST_PAGE, p + 1))}
              disabled={page === LAST_PAGE || LAST_PAGE === 0}
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
