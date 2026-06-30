"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetManageHotelsQuery,
  useUpdateStatusMutation,
} from "@/features/manageProperty/managePropertyApi";
import { baseURL } from "@/utils/BaseURL";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MapPin,
  Star,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { CustomLoading } from "../../hooks/CustomLoading";

/* ── helpers ── */
function imgUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseURL}${path}`;
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    active: { bg: "#E8F5E9", color: "#2B9724", border: "#2B9724" },
    draft: { bg: "#F2F2F2", color: "#6C757D", border: "#D1D5DB" },
    inactive: { bg: "#FEF0E4", color: "#F1913D", border: "#F1913D" },
    close: { bg: "#FEE2E2", color: "#DC3545", border: "#DC3545" },
  };
  const s = status?.toLowerCase() ?? "";
  const style = map[s] ?? { bg: "#F9FAFB", color: "#6C757D", border: "#D1D5DB" };
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize border"
      style={{ backgroundColor: style.bg, color: style.color, borderColor: style.border }}>
      {status || "Unknown"}
    </span>
  );
}

const STRUCTURE_TYPES = ["hotel", "resort", "guest_house", "treehouse", "houseboat", "farmhouse", "villa"];
const STATUS_OPTIONS = ["active", "draft", "inactive", "close"];

interface Hotel {
  _id: string;
  title: string;
  description?: string;
  structureType: string;
  price?: number;
  currency?: string;
  images?: string[];
  videoUrl?: string;
  address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string };
  location?: { coordinates?: [number, number] };
  amenities?: string[];
  status?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  averageRating?: number;
  ratingCount?: number;
  uid?: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F1913D" }}>
      {children}
    </p>
  );
}

/* ── Hotel Detail Modal ── */
function HotelDetailModal({
  hotel,
  open,
  onClose,
}: {
  hotel: Hotel | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [localStatus, setLocalStatus] = useState(hotel?.status ?? "active");
  const [localFeatured, setLocalFeatured] = useState(hotel?.isFeatured ?? false);
  const [localVerified, setLocalVerified] = useState(hotel?.isVerified ?? false);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateStatusMutation();

  if (!hotel) return null;

  const images = hotel.images ?? [];

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  const handleUpdate = async () => {
    try {
      await updateStatus({
        propertyId: hotel._id,
        data: { status: localStatus, isFeatured: localFeatured, isVerified: localVerified },
      }).unwrap();
      toast.success("Status updated successfully!");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to update status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setActiveImg(0); } }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">

        {/* Image Gallery */}
        {images.length > 0 ? (
          <div className="relative w-full bg-gray-900 overflow-hidden rounded-t-2xl" style={{ height: "450px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl(images[activeImg])} alt={hotel.title}
              className="w-full h-full object-contain" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />

            {images.length > 1 && (
              <>
                <button type="button" onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button type="button" onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-14 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white">
                  {activeImg + 1} / {images.length}
                </div>
                <div className="absolute bottom-2 left-4 flex gap-1.5 overflow-x-auto pb-0.5 z-10">
                  {images.map((src, i) => (
                    <button key={i} type="button" onClick={() => setActiveImg(i)}
                      className="shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                      style={{ borderColor: i === activeImg ? "#F1913D" : "rgba(255,255,255,0.4)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl(src)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-16 left-4 right-4 z-20">
              <p className="text-white font-bold text-lg leading-tight line-clamp-1">{hotel.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {hotel.uid && <span className="text-white/70 text-xs">{hotel.uid}</span>}
                <span className="text-white/50 text-xs">•</span>
                <span className="text-white/90 text-xs capitalize">{hotel.structureType?.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-28 rounded-t-2xl flex items-center justify-center bg-gray-100">
            <p className="text-sm" style={{ color: "#6C757D" }}>No images available</p>
          </div>
        )}

        <div className="p-6 space-y-6">

          {/* Header: badges + price */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={hotel.status} />
              {hotel.isVerified && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
              {hotel.isFeatured && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#FFF7ED", color: "#EA580C" }}>
                  <Star className="w-3 h-3 fill-current" /> Featured
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: "#F1913D" }}>
                {hotel.price?.toLocaleString()} <span className="text-base">{hotel.currency}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6C757D" }}>per night</p>
            </div>
          </div>

          {/* Description */}
          {hotel.description && (
            <div className="rounded-xl p-4" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
              <SectionLabel>Description</SectionLabel>
              <p className="text-sm leading-relaxed line-clamp-5" style={{ color: "#6C757D" }}>
                {hotel.description}
              </p>
            </div>
          )}

          {/* Location */}
          <div>
            <SectionLabel>Location</SectionLabel>
            <div className="rounded-xl p-4" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "#F1913D" }} />
                <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                  {[hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {([
                  { label: "Street", value: hotel.address?.street },
                  { label: "City", value: hotel.address?.city },
                  { label: "State", value: hotel.address?.state },
                  { label: "Postal Code", value: hotel.address?.postalCode },
                  { label: "Country", value: hotel.address?.country },
                  hotel.location?.coordinates?.length === 2
                    ? { label: "Coordinates", value: `${hotel.location.coordinates[1].toFixed(4)}, ${hotel.location.coordinates[0].toFixed(4)}` }
                    : null,
                ] as ({ label: string; value: string | undefined } | null)[])
                  .filter((r): r is { label: string; value: string } => !!r && !!r.value)
                  .map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6C757D" }}>{label}</span>
                      <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div>
              <SectionLabel>Amenities</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span key={a} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#FEF0E4", color: "#F1913D", border: "1px solid #FDDBB4" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {hotel.videoUrl && (
            <div>
              <SectionLabel>Property Video</SectionLabel>
              <video src={imgUrl(hotel.videoUrl)} controls className="w-full rounded-xl"
                style={{ maxHeight: "240px", backgroundColor: "#000" }} />
            </div>
          )}

          {/* ── Status & Featured Controls ── */}
          <div className="rounded-xl border-2 p-5 space-y-4" style={{ borderColor: "#F2F2F2" }}>
            <SectionLabel>Manage Status</SectionLabel>
            <div className="flex items-end gap-4 flex-wrap">

              {/* Status dropdown */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                <label className="text-xs font-semibold" style={{ color: "#2C2E33" }}>Property Status</label>
                <Select value={localStatus} onValueChange={setLocalStatus}>
                  <SelectTrigger className="h-11 w-full rounded-lg border text-sm"
                    style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Featured switch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "#2C2E33" }}>Featured</label>
                <div className="h-11 flex items-center gap-3 px-4 rounded-lg border"
                  style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA" }}>
                  <Switch
                    checked={localFeatured}
                    onCheckedChange={setLocalFeatured}
                    className="data-[state=checked]:bg-[#F1913D]"
                  />
                  <span className="text-sm font-medium"
                    style={{ color: localFeatured ? "#F1913D" : "#6C757D" }}>
                    {localFeatured ? "Featured" : "Not Featured"}
                  </span>
                </div>
              </div>

              {/* Verified switch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "#2C2E33" }}>Verified</label>
                <div className="h-11 flex items-center gap-3 px-4 rounded-lg border"
                  style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA" }}>
                  <Switch
                    checked={localVerified}
                    onCheckedChange={setLocalVerified}
                    className="data-[state=checked]:bg-[#2B9724]"
                  />
                  <span className="text-sm font-medium"
                    style={{ color: localVerified ? "#2B9724" : "#6C757D" }}>
                    {localVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>

              {/* Update button */}
              <Button onClick={handleUpdate} disabled={isUpdating}
                className="h-11 px-6 rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-2 shrink-0"
                style={{ backgroundColor: "#F1913D", color: "#FFF" }}>
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ── */
export default function ManageHotel() {
  const [page, setPage] = useState(1);
  const [structureType, setStructureType] = useState("");
  const [status, setStatus] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const params: Record<string, string | number> = { page, limit: 10 };
  if (structureType) params.structureType = structureType;
  if (status) params.status = status;
  if (isVerified !== "") params.isVerified = isVerified;

  const { data: hotelData, isLoading, isError } = useGetManageHotelsQuery(params, { pollingInterval: 5000 });

  const hotels: Hotel[] = hotelData?.data ?? [];
  const pagination = hotelData?.pagination ?? { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load hotels</div>;

  const LAST_PAGE = pagination.totalPage;
  const PER_PAGE = pagination.limit;
  const TOTAL = pagination.total;
  const pages = Array.from({ length: LAST_PAGE }, (_, i) => i + 1);

  const handleFilter = (setter: (v: string) => void) => (val: string) => {
    setter(val === "all" ? "" : val);
    setPage(1);
  };

  return (
    <div className="space-y-6">

      {selectedHotel && (
        <HotelDetailModal
          hotel={selectedHotel}
          open={!!selectedHotel}
          onClose={() => setSelectedHotel(null)}
        />
      )}

      {/* Filters */}
      <Card className="p-4 border-none shadow-sm bg-white">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6C757D" }}>Structure Type</label>
            <Select onValueChange={handleFilter(setStructureType)} defaultValue="all">
              <SelectTrigger className="h-10 w-full text-sm rounded-lg border"
                style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {STRUCTURE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6C757D" }}>Status</label>
            <Select onValueChange={handleFilter(setStatus)} defaultValue="all">
              <SelectTrigger className="h-10 w-full text-sm rounded-lg border"
                style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6C757D" }}>Verification</label>
            <Select onValueChange={handleFilter(setIsVerified)} defaultValue="all">
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
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            All Hotels & Accommodations
          </h2>
          <p className="text-sm" style={{ color: "#6C757D" }}>{TOTAL} total</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Hotel</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Location</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Price / Night</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Amenities</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Verification</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">No hotels found</TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel) => (
                  <TableRow key={hotel._id} style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors">

                    {/* Hotel */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {hotel.images?.[0] ? (
                            <Image src={imgUrl(hotel.images[0])} alt={hotel.title}
                              fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold line-clamp-1" style={{ color: "#2C2E33" }}>
                            {hotel.title}
                          </p>
                          <p className="text-xs capitalize" style={{ color: "#6C757D" }}>
                            {hotel.structureType?.replace(/_/g, " ")} • {hotel.uid}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#F1913D" }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>{hotel.address?.city}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{hotel.address?.country}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <p className="text-sm font-bold" style={{ color: "#F1913D" }}>
                        {hotel.price?.toLocaleString()} {hotel.currency}
                      </p>
                    </TableCell>

                    {/* Amenities */}
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "#FEF0E4", color: "#F1913D" }}>
                        {hotel.amenities?.length ?? 0} amenities
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={hotel.status} />
                        {hotel.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold"
                            style={{ color: "#EA580C" }}>
                            <Star className="w-3 h-3 fill-current" /> Featured
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Verification */}
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

                    {/* Action */}
                    <TableCell className="text-center">
                      <button type="button" onClick={() => setSelectedHotel(hotel)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-orange-50 cursor-pointer"
                        style={{ borderColor: "#F2F2F2" }} title="View Details">
                        <Eye className="w-4 h-4" style={{ color: "#F1913D" }} />
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
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {pages.map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 text-sm rounded-lg font-medium transition-colors cursor-pointer"
                style={page === p ? { backgroundColor: "#F1913D", color: "#FFF" } : { color: "#2C2E33" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(LAST_PAGE, p + 1))}
              disabled={page === LAST_PAGE || LAST_PAGE === 0}
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
