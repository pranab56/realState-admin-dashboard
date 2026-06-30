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
import {
  useDeletePropertyMutation,
  useGetManageListingQuery,
} from "@/features/manageProperty/managePropertyApi";
import { useMarkPageSeen } from "@/hooks/useMarkPageSeen";
import { useNewItemsTracker } from "@/hooks/useNewItemsTracker";
import MarkAllSeenButton from "@/components/notifications/MarkAllSeenButton";
import NewPulseDot from "@/components/notifications/NewPulseDot";
import { baseURL } from "@/utils/BaseURL";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Ruler,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { CustomLoading } from "../../hooks/CustomLoading";
import AddPropertyForm, { PropertyInitialData } from "./AddPropertyForm";

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
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F1913D" }}>
      {children}
    </p>
  );
}

function PropertyDetailModal({ prop, open, onClose }: { prop: Property | null; open: boolean; onClose: () => void }) {
  const [activeImg, setActiveImg] = useState(0);

  if (!prop) return null;

  const images: string[] = prop.images || [];
  const listing = prop.listing || {};

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setActiveImg(0); } }}>
      <DialogContent className="max-w-3xl max-h-[90vh] border border-red-500 overflow-y-auto p-0 gap-0 rounded-2xl">

        {/* ── Image Gallery ── */}
        {images.length > 0 ? (
          <div className="relative w-full bg-gray-900 overflow-hidden rounded-t-2xl" style={{ height: "400px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl(images[activeImg])}
              alt="property"
              className="w-full h-full object-contain transition-opacity duration-200"
            />
            {/* dark gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

            {/* nav arrows */}
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
              </>
            )}

            {/* counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white">
                {activeImg + 1} / {images.length}
              </div>
            )}

            {/* title overlay */}
            <div className="absolute bottom-15 left-4 right-16">
              <p className="text-white font-bold text-lg leading-tight line-clamp-1">{prop.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {prop.uid && <span className="text-white/70 text-xs">{prop.uid}</span>}
                <span className="text-white/70 text-xs">•</span>
                <span className="text-white/90 text-xs capitalize">{prop.structureType?.replace(/_/g, " ")}</span>
              </div>
            </div>

            {/* thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 px-4 pb-2 pt-8 overflow-x-auto"
                style={{ background: "none" }}>
                {images.map((src, i) => (
                  <button key={i} type="button" onClick={() => setActiveImg(i)}
                    className="shrink-0 w-12 h-8 rounded overflow-hidden border-2 transition-all"
                    style={{ borderColor: i === activeImg ? "#F1913D" : "rgba(255,255,255,0.3)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl(src)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-32 rounded-t-2xl flex items-center justify-center bg-gray-100">
            <p className="text-sm" style={{ color: "#6C757D" }}>No images available</p>
          </div>
        )}

        {/* ── Content ── */}
        <div className="p-6 space-y-6">

          {/* Header row: badges + price */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap gap-2">
              <PurposeBadge purpose={listing.purpose} />
              <StatusBadge status={prop.status} />
              {prop.isVerified && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
              {prop.isFeatured && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#FFF7ED", color: "#EA580C" }}>
                  <Star className="w-3 h-3 fill-current" /> Featured
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: "#F1913D" }}>
                {prop.price?.toLocaleString()} <span className="text-base">{prop.currency}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6C757D" }}>
                {listing.purpose === "for_rent" ? "/ month" : "sale price"}
              </p>
            </div>
          </div>

          {/* Description */}
          {prop.description && (
            <div className="rounded-xl p-4" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
              <SectionLabel>Description</SectionLabel>
              <p className="text-sm leading-relaxed" style={{ color: "#6C757D" }}>{prop.description}</p>
            </div>
          )}

          {/* Property Features */}
          <div>
            <SectionLabel>Property Features</SectionLabel>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: BedDouble, label: "Bedrooms", value: listing.bedrooms ?? "—" },
                { icon: Bath, label: "Bathrooms", value: listing.bathrooms ?? "—" },
                { icon: Car, label: "Garage", value: listing.garage ?? "—" },
                { icon: Ruler, label: "Total Area", value: listing.totalArea ? `${listing.totalArea.toLocaleString()}` : "—", unit: "sqft" },
              ].map(({ icon: Icon, label, value, unit }) => (
                <div key={label}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center"
                  style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FEF0E4" }}>
                    <Icon className="w-4 h-4" style={{ color: "#F1913D" }} />
                  </div>
                  <p className="text-base font-bold leading-tight" style={{ color: "#2C2E33" }}>{value}</p>
                  {unit && <p className="text-[10px]" style={{ color: "#F1913D" }}>{unit}</p>}
                  <p className="text-[11px]" style={{ color: "#6C757D" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Extra details */}
          {(listing.landArea || listing.yearBuilt || listing.availableFrom || (prop.ratingCount && prop.ratingCount > 0)) && (
            <div>
              <SectionLabel>Additional Info</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {listing.landArea ? (
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                    <p className="text-[11px]" style={{ color: "#6C757D" }}>Land Area</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#2C2E33" }}>{listing.landArea.toLocaleString()} sqft</p>
                  </div>
                ) : null}
                {listing.yearBuilt ? (
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                    <p className="text-[11px]" style={{ color: "#6C757D" }}>Year Built</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#2C2E33" }}>{listing.yearBuilt}</p>
                  </div>
                ) : null}
                {listing.availableFrom ? (
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                    <p className="text-[11px]" style={{ color: "#6C757D" }}>Available From</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#2C2E33" }}>
                      {new Date(listing.availableFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ) : null}
                {(prop.ratingCount && prop.ratingCount > 0) ? (
                  <div className="rounded-xl p-3 flex items-center gap-2" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                    <Star className="w-4 h-4 shrink-0 fill-[#F1913D] text-[#F1913D]" />
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>{prop.averageRating}</p>
                      <p className="text-[11px]" style={{ color: "#6C757D" }}>{prop.ratingCount} reviews</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Address */}
          <div>
            <SectionLabel>Location</SectionLabel>
            <div className="rounded-xl p-4" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "#F1913D" }} />
                <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                  {[prop.address?.city, prop.address?.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Street", value: prop.address?.street },
                  { label: "City", value: prop.address?.city },
                  { label: "State", value: prop.address?.state },
                  { label: "Postal Code", value: prop.address?.postalCode },
                  { label: "Country", value: prop.address?.country },
                  prop.location?.coordinates?.length === 2
                    ? { label: "Coordinates", value: `${prop.location.coordinates[1].toFixed(4)}, ${prop.location.coordinates[0].toFixed(4)}` }
                    : null,
                ].filter((r): r is { label: string; value: string } => !!r && !!r.value).map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#6C757D" }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities */}
          {prop.amenities && prop.amenities.length > 0 && (
            <div>
              <SectionLabel>Amenities</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {prop.amenities.map((a: string) => (
                  <span key={a}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#FEF0E4", color: "#F1913D", border: "1px solid #FDDBB4" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Landmarks */}
          {listing.landmarks && listing.landmarks.length > 0 && (
            <div>
              <SectionLabel>Nearby Landmarks</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {listing.landmarks.map((lm) => (
                  <div key={lm._id}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: "#FAFAFA", border: "1px solid #F2F2F2" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#FEF0E4" }}>
                      <MapPin className="w-3 h-3" style={{ color: "#F1913D" }} />
                    </div>
                    <span className="text-sm flex-1 font-medium" style={{ color: "#2C2E33" }}>{lm.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#F2F2F2", color: "#6C757D" }}>
                      {lm.distanceInKm} km
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {prop.videoUrl && (
            <div>
              <SectionLabel>Property Video</SectionLabel>
              <video
                src={imgUrl(prop.videoUrl)}
                controls
                className="w-full rounded-xl"
                style={{ maxHeight: "260px", backgroundColor: "#000" }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Edit Modal ───────────────────────── */
function EditPropertyModal({ prop, open, onClose }: { prop: Property | null; open: boolean; onClose: () => void }) {
  if (!prop) return null;

  const initialData: PropertyInitialData = {
    title: prop.title,
    description: prop.description,
    structureType: prop.structureType,
    price: prop.price,
    currency: prop.currency,
    listing: prop.listing,
    address: prop.address,
    location: prop.location,
    amenities: prop.amenities,
    images: prop.images,
    videoUrl: prop.videoUrl,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 gap-0" style={{ height: "90vh" }}>
        <div className="px-6 pt-5 pb-4 border-b shrink-0" style={{ borderColor: "#F2F2F2" }}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold" style={{ color: "#2C2E33" }}>
              Edit Listing
            </DialogTitle>
            <p className="text-xs mt-0.5" style={{ color: "#6C757D" }}>{prop.title}</p>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4 flex flex-col min-h-0">
          <AddPropertyForm
            initialData={initialData}
            propertyId={prop._id}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Delete Confirm Modal ─────────────── */
function DeleteConfirmModal({
  propTitle,
  open,
  isDeleting,
  onConfirm,
  onClose,
}: {
  propTitle: string;
  open: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-xl p-6 gap-0">
        <DialogHeader>
          <DialogTitle className="text-base font-bold" style={{ color: "#2C2E33" }}>
            Delete Listing
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto"
            style={{ backgroundColor: "#FEE2E2" }}>
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-center" style={{ color: "#6C757D" }}>
            Are you sure you want to delete{" "}
            <span className="font-semibold" style={{ color: "#2C2E33" }}>&quot;{propTitle}&quot;</span>?
            <br />This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}
              className="flex-1 h-10 rounded-lg text-sm font-semibold border cursor-pointer"
              style={{ borderColor: "#F2F2F2", color: "#2C2E33" }}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={isDeleting}
              className="flex-1 h-10 rounded-lg text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white">
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
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
  const [editProp, setEditProp] = useState<Property | null>(null);
  const [deleteProp, setDeleteProp] = useState<Property | null>(null);

  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const params: Record<string, string | number> = { page, limit: 10 };
  if (structureType) params.structureType = structureType;
  if (status) params.status = status;
  if (isVerified !== "") params.isVerified = isVerified;
  if (listingPurpose) params.listingPurpose = listingPurpose;

  const { data: propertyListingData, isLoading, isError } = useGetManageListingQuery(params, { pollingInterval: 3000 });
  useMarkPageSeen("propertyListing", propertyListingData?.pagination?.total);
  const { isNew, dismiss, dismissAll } = useNewItemsTracker(
    "propertyListing",
    (propertyListingData?.data || []).map((p: Property) => p._id)
  );

  const properties = propertyListingData?.data || [];
  const newCount = properties.filter((p: Property) => isNew(p._id)).length;
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

  const handleDelete = async () => {
    if (!deleteProp) return;
    try {
      await deleteProperty(deleteProp._id).unwrap();
      toast.success("Listing deleted successfully!");
      setDeleteProp(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete listing");
    }
  };

  return (
    <div className="space-y-6">

      {/* Detail modal */}
      <PropertyDetailModal
        prop={selectedProp}
        open={!!selectedProp}
        onClose={() => setSelectedProp(null)}
      />

      {/* Edit modal */}
      <EditPropertyModal
        prop={editProp}
        open={!!editProp}
        onClose={() => setEditProp(null)}
      />

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        propTitle={deleteProp?.title ?? ""}
        open={!!deleteProp}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteProp(null)}
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
          <div className="flex items-center gap-3">
            <MarkAllSeenButton count={newCount} onClick={() => dismissAll()} />
            <Button
              onClick={() => router.push("/property-management/add")}
              className="h-9 px-4 text-sm font-semibold rounded-lg gap-2 cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#F1913D", color: "#FFFFFF" }}
            >
              <Plus className="w-4 h-4" />
              Add New Listing
            </Button>
          </div>
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
                            <Image src={imgUrl(prop.images[0])} alt={prop.title} fill className="object-cover" unoptimized />
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
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => { setSelectedProp(prop); dismiss(prop._id); }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-orange-50 cursor-pointer"
                          style={{ borderColor: "#F2F2F2" }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" style={{ color: "#F1913D" }} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => setEditProp(prop)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-blue-50 cursor-pointer"
                          style={{ borderColor: "#F2F2F2" }}
                          title="Edit Listing"
                        >
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteProp(prop)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-red-50 cursor-pointer"
                          style={{ borderColor: "#F2F2F2" }}
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
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
