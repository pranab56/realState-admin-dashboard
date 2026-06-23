"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useGetManageListingQuery } from "@/features/manageProperty/managePropertyApi";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import NewPulseDot from "@/components/notifications/NewPulseDot";
import { baseURL } from "@/utils/BaseURL";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Maximize2,
  Plus,
  Ruler,
  Star,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomLoading } from "../../hooks/CustomLoading";

/* ─────────────────────────── helpers ─────────────────────────── */
function imgUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseURL}${path}`;
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "active")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>Active</span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
        style={{ borderColor: "#F1913D", color: "#F1913D", backgroundColor: "#FEF0E4" }}>Pending</span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ borderColor: "#D1D5DB", color: "#6C757D", backgroundColor: "#F9FAFB" }}>{status || "Unknown"}</span>
  );
}

function PurposeBadge({ purpose }: { purpose?: string }) {
  if (!purpose) return <span className="text-xs text-gray-400">—</span>;
  const isRent = purpose === "for_rent";
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: isRent ? "#EEF2FF" : "#FFF7ED", color: isRent ? "#4F46E5" : "#EA580C" }}>
      {isRent ? "For Rent" : "For Sale"}
    </span>
  );
}

const STRUCTURE_TYPES = ["apartment", "villa", "house", "penthouse", "office", "shop", "warehouse", "hotel", "resort"];

interface Listing {
  purpose?: string;
  bedrooms?: number;
  bathrooms?: number;
  garage?: number;
  totalArea?: number;
  landArea?: number;
  yearBuilt?: string;
  availableFrom?: string;
  landmarks?: Array<{ _id: string; name: string; distanceInKm: number }>;
}

interface Property {
  _id: string;
  title: string;
  structureType: string;
  images?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  listing?: Listing;
  price?: number;
  currency?: string;
  status?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  averageRating?: number;
  ratingCount?: number;
  description?: string;
  videoUrl?: string;
  location?: { coordinates?: [number, number] };
  amenities?: string[];
  uid?: string;
  createdAt?: string;
}

/* ─────────────────────────── Detail Modal ─────────────────────── */
function PropertyDetailModal({ prop, open, onClose }: { prop: Property | null; open: boolean; onClose: () => void }) {
  const [activeImg, setActiveImg] = useState(0);

  if (!prop) return null;

  const images: string[] = prop.images || [];
  const listing = prop.listing || {};

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">

        {/* Header strip */}
        <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: "#F2F2F2" }}>
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <DialogTitle className="text-base font-bold leading-snug" style={{ color: "#2C2E33" }}>
                  {prop.title}
                </DialogTitle>
                {prop.uid && (
                  <p className="text-xs mt-0.5" style={{ color: "#6C757D" }}>ID: {prop.uid}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                  style={{ backgroundColor: "#F2F2F2", color: "#2C2E33" }}>
                  {prop.structureType?.replace(/_/g, " ")}
                </span>
                <PurposeBadge purpose={listing.purpose} />
                <StatusBadge status={prop.status} />
                {prop.isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {prop.isFeatured && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#FFF7ED", color: "#EA580C" }}>
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">

          {/* Image gallery */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="relative w-full rounded-xl overflow-hidden bg-gray-100"
                style={{ aspectRatio: "16/7" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl(images[activeImg])} alt="main"
                  className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-white">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((src, i) => (
                    <button key={i} type="button" onClick={() => setActiveImg(i)}
                      className="shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all"
                      style={{ borderColor: i === activeImg ? "#F1913D" : "transparent" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl(src)} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price + rating row */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xl font-bold" style={{ color: "#F1913D" }}>
                {prop.price?.toLocaleString()} {prop.currency}
              </p>
              <p className="text-xs" style={{ color: "#6C757D" }}>
                {listing.purpose === "for_rent" ? "per month" : "sale price"}
              </p>
            </div>
            {(prop.ratingCount && prop.ratingCount > 0) && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Star className="w-4 h-4 fill-[#F1913D] text-[#F1913D]" />
                <span className="text-sm font-bold" style={{ color: "#2C2E33" }}>{prop.averageRating}</span>
                <span className="text-xs" style={{ color: "#6C757D" }}>({prop.ratingCount} reviews)</span>
              </div>
            )}
          </div>

          {/* Description */}
          {prop.description && (
            <p className="text-sm leading-relaxed" style={{ color: "#6C757D" }}>{prop.description}</p>
          )}

          {/* Feature cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: BedDouble, label: "Bedrooms", value: listing.bedrooms ?? "—" },
              { icon: Bath, label: "Bathrooms", value: listing.bathrooms ?? "—" },
              { icon: Car, label: "Garage", value: listing.garage ?? "—" },
              { icon: Ruler, label: "Total Area", value: listing.totalArea ? `${listing.totalArea.toLocaleString()} sqft` : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center"
                style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                <Icon className="w-4 h-4" style={{ color: "#F1913D" }} />
                <p className="text-base font-bold" style={{ color: "#2C2E33" }}>{value}</p>
                <p className="text-[11px]" style={{ color: "#6C757D" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Extra listing info */}
          {(listing.landArea || listing.yearBuilt || listing.availableFrom) && (
            <div className="grid grid-cols-3 gap-3">
              {listing.landArea && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                  <p className="text-[11px]" style={{ color: "#6C757D" }}>Land Area</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "#2C2E33" }}>{listing.landArea.toLocaleString()} sqft</p>
                </div>
              )}
              {listing.yearBuilt && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                  <p className="text-[11px]" style={{ color: "#6C757D" }}>Year Built</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "#2C2E33" }}>{listing.yearBuilt}</p>
                </div>
              )}
              {listing.availableFrom && (
                <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                  <CalendarDays className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#F1913D" }} />
                  <div>
                    <p className="text-[11px]" style={{ color: "#6C757D" }}>Available From</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#2C2E33" }}>
                      {new Date(listing.availableFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" style={{ color: "#F1913D" }} />
              <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Address</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {[
                { label: "Street", value: prop.address?.street },
                { label: "City", value: prop.address?.city },
                { label: "State", value: prop.address?.state },
                { label: "Postal Code", value: prop.address?.postalCode },
                { label: "Country", value: prop.address?.country },
              ].filter((r) => r.value).map(({ label, value }) => (
                <div key={label}>
                  <span className="text-xs" style={{ color: "#6C757D" }}>{label}: </span>
                  <span className="font-medium" style={{ color: "#2C2E33" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {prop.amenities && prop.amenities.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#2C2E33" }}>Amenities</p>
              <div className="flex flex-wrap gap-2">
                {prop.amenities.map((a: string) => (
                  <span key={a} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: "#FEF0E4", color: "#F1913D" }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Landmarks */}
          {listing.landmarks && listing.landmarks.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#2C2E33" }}>Nearby Landmarks</p>
              <div className="grid grid-cols-2 gap-2">
                {listing.landmarks.map((lm: { _id: string; name: string; distanceInKm: number }) => (
                  <div key={lm._id} className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#F1913D" }} />
                    <span className="text-sm flex-1" style={{ color: "#2C2E33" }}>{lm.name}</span>
                    <span className="text-xs font-medium" style={{ color: "#6C757D" }}>{lm.distanceInKm} km</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {prop.videoUrl && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#2C2E33" }}>Property Video</p>
              <video
                src={imgUrl(prop.videoUrl)}
                controls
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: "260px", backgroundColor: "#000" }}
              />
            </div>
          )}

          {/* Location coordinates */}
          {prop.location?.coordinates?.length === 2 && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#6C757D" }}>
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                Coordinates: {prop.location.coordinates[1].toFixed(5)}, {prop.location.coordinates[0].toFixed(5)}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Main Component ─────────────────── */
export default function PropertyListing() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [structureType, setStructureType] = useState("");
  const [status, setStatus] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [listingPurpose, setListingPurpose] = useState("");
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  const params: Record<string, string | number> = { page, limit: 10 };
  if (structureType) params.structureType = structureType;
  if (status) params.status = status;
  if (isVerified !== "") params.isVerified = isVerified;
  if (listingPurpose) params.listingPurpose = listingPurpose;

  const { data: propertyListingData, isLoading, isError } = useGetManageListingQuery(params, { pollingInterval: 3000 });
  useMarkPageSeen("propertyListing", propertyListingData?.pagination?.total);
  const { isNew, dismiss } = useNewItemsTracker(
    "propertyListing",
    (propertyListingData?.data || []).map((p: Property) => p._id)
  );

  const properties = propertyListingData?.data || [];
  const pagination = propertyListingData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load properties</div>;

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

      {/* Detail modal */}
      <PropertyDetailModal
        prop={selectedProp}
        open={!!selectedProp}
        onClose={() => setSelectedProp(null)}
      />

      {/* Filters */}
      <Card className="p-4 border-none shadow-sm bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6C757D" }}>Purpose</label>
            <Select onValueChange={handleFilterChange(setListingPurpose)} defaultValue="all">
              <SelectTrigger className="h-10 w-full text-sm rounded-lg border"
                style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="for_rent">For Rent</SelectItem>
                <SelectItem value="for_sale">For Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>All Listings</h2>
          <Button
            onClick={() => router.push("/property-management/add")}
            className="h-9 px-4 text-sm font-semibold rounded-lg gap-2 cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F1913D", color: "#FFFFFF" }}
          >
            <Plus className="w-4 h-4" />
            Add New Listing
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Property Details</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Location</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Purpose</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Beds / Baths</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Verification</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">No listings found</TableCell>
                </TableRow>
              ) : (
                properties.map((prop: Property) => (
                  <TableRow key={prop._id} style={{ borderColor: "#F2F2F2" }} className="hover:bg-gray-50/60 transition-colors">

                    {/* Property Details */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        {isNew(prop._id) && <NewPulseDot />}
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {prop.images?.[0] ? (
                            <Image src={imgUrl(prop.images[0])} alt={prop.title} fill className="object-cover"
                              unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold line-clamp-1" style={{ color: "#2C2E33" }}>{prop.title}</p>
                          <p className="text-xs capitalize" style={{ color: "#6C757D" }}>
                            {prop.structureType} • {prop.price?.toLocaleString()} {prop.currency}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#F1913D" }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>{prop.address?.city}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{prop.address?.country}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Purpose */}
                    <TableCell>
                      <PurposeBadge purpose={prop.listing?.purpose} />
                    </TableCell>

                    {/* Beds / Baths */}
                    <TableCell>
                      <p className="text-sm font-medium" style={{ color: "#2C2E33" }}>
                        {prop.listing?.bedrooms ?? "—"} bd / {prop.listing?.bathrooms ?? "—"} ba
                      </p>
                      <p className="text-xs" style={{ color: "#6C757D" }}>
                        {prop.listing?.totalArea ? `${prop.listing.totalArea.toLocaleString()} sqft` : ""}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={prop.status} />
                    </TableCell>

                    {/* Verification */}
                    <TableCell>
                      {prop.isVerified ? (
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
                      <button
                        type="button"
                        onClick={() => { setSelectedProp(prop); dismiss(prop._id); }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-orange-50 cursor-pointer"
                        style={{ borderColor: "#F2F2F2" }}
                        title="View Details"
                      >
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
                style={page === p ? { backgroundColor: "#F1913D", color: "#FFFFFF" } : { color: "#2C2E33" }}>
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
