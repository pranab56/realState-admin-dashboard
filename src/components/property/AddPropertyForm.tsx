"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateManagePropertyMutation,
  useUpdateManagePropertyMutation,
} from "@/features/manageProperty/managePropertyApi";
import { baseURL } from "@/utils/BaseURL";
import { motion } from "framer-motion";
import {
  CloudUpload,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

const AMENITIES_LIST = [
  "Free WiFi", "Indoor Pool", "Gym", "Full Spa", "Fine Dining",
  "Lounge Bar", "Parking Space", "Garden/Landscaping", "Sauna",
  "Tennis Court", "Security", "Elevator",
];

const STRUCTURE_TYPES = [
  "house", "apartment", "villa", "penthouse", "office",
  "shop", "warehouse", "hotel", "resort", "guest_house",
  "treehouse", "houseboat", "farmhouse",
];

/* ── Layout helpers ──────────────────────────────────────────── */
function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
    >
      <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>{title}</h2>
      {children}
    </motion.div>
  );
}

function Field({ label, required, optional, error, children }: {
  label: string; required?: boolean; optional?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "#2C2E33" }}>
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-xs font-normal" style={{ color: "#6C757D" }}>(Optional)</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: "#EF4444" }}>
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <Label className="text-sm font-medium" style={{ color: "#2C2E33" }}>{label}</Label>
      <div
        className="flex items-center justify-between h-11 rounded-lg border px-4 gap-3"
        style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA" }}
      >
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer"
          style={{ backgroundColor: "#F2F2F2" }}>
          <Minus className="w-3 h-3" style={{ color: "#2C2E33" }} />
        </button>
        <span className="text-sm font-semibold w-4 text-center" style={{ color: "#2C2E33" }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: "#F1913D" }}>
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}

const inputCls = "h-11 rounded-lg border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

interface Landmark { name: string; distanceInKm: number; }
interface GooglePrediction {
  placeId: string;
  text: { text: string };
  structuredFormat?: {
    mainText: { text: string };
    secondaryText?: { text: string };
  };
}

export interface PropertyInitialData {
  title?: string;
  description?: string;
  structureType?: string;
  price?: number;
  currency?: string;
  listing?: {
    purpose?: string;
    bedrooms?: number;
    bathrooms?: number;
    garage?: number;
    totalArea?: number;
    landArea?: number;
    yearBuilt?: string;
    availableFrom?: string;
    landmarks?: Array<{ name: string; distanceInKm: number }>;
  };
  address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string };
  location?: { coordinates?: [number, number] };
  amenities?: string[];
  images?: string[];
  videoUrl?: string;
}

function serverImgUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseURL}${path}`;
}

export default function AddPropertyForm({
  onCancel,
  initialData,
  propertyId,
}: {
  onCancel?: () => void;
  initialData?: PropertyInitialData;
  propertyId?: string;
}) {
  const [createProperty, { isLoading: isCreating }] = useCreateManagePropertyMutation();
  const [updateProperty, { isLoading: isUpdating }] = useUpdateManagePropertyMutation();
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!propertyId;
  const router = useRouter();

  /* ── Basic fields ── */
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [structureType, setStructureType] = useState(initialData?.structureType ?? "villa");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [currency] = useState(initialData?.currency ?? "USD");
  const [purpose, setPurpose] = useState(initialData?.listing?.purpose ?? "for_rent");
  const [bedrooms, setBedrooms] = useState(initialData?.listing?.bedrooms ?? 0);
  const [bathrooms, setBathrooms] = useState(initialData?.listing?.bathrooms ?? 0);
  const [garage, setGarage] = useState(initialData?.listing?.garage ?? 0);
  const [totalArea, setTotalArea] = useState(
    initialData?.listing?.totalArea ? String(initialData.listing.totalArea) : ""
  );
  const [landArea, setLandArea] = useState(
    initialData?.listing?.landArea ? String(initialData.listing.landArea) : ""
  );
  const [yearBuilt, setYearBuilt] = useState(
    initialData?.listing?.yearBuilt ?? String(new Date().getFullYear())
  );
  const [availableFrom, setAvailableFrom] = useState(
    initialData?.listing?.availableFrom
      ? new Date(initialData.listing.availableFrom).toISOString().split("T")[0]
      : ""
  );
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities ?? []);
  const [landmarks, setLandmarks] = useState<Landmark[]>(
    initialData?.listing?.landmarks?.length
      ? initialData.listing.landmarks.map((lm) => ({ name: lm.name, distanceInKm: lm.distanceInKm }))
      : [{ name: "", distanceInKm: 0 }]
  );

  /* ── Address ── */
  const [addressInput, setAddressInput] = useState(
    initialData?.address
      ? [initialData.address.street, initialData.address.city, initialData.address.country]
          .filter(Boolean).join(", ")
      : ""
  );
  const [suggestions, setSuggestions] = useState<GooglePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [street, setStreet] = useState(initialData?.address?.street ?? "");
  const [city, setCity] = useState(initialData?.address?.city ?? "");
  const [state, setState] = useState(initialData?.address?.state ?? "");
  const [postalCode, setPostalCode] = useState(initialData?.address?.postalCode ?? "");
  const [country, setCountry] = useState(initialData?.address?.country ?? "");
  const [latitude, setLatitude] = useState(
    initialData?.location?.coordinates ? String(initialData.location.coordinates[1]) : ""
  );
  const [longitude, setLongitude] = useState(
    initialData?.location?.coordinates ? String(initialData.location.coordinates[0]) : ""
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Existing media (edit mode) ── */
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images ?? []);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>(initialData?.videoUrl ?? "");

  /* ── New images ── */
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  /* ── New video ── */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const videoRef = useRef<HTMLInputElement>(null);

  /* ── Validation errors ── */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) =>
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  /* ── Google Places address search ── */
  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddressInput(val);
    setSuggestions([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setShowDropdown(false); return; }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          },
          body: JSON.stringify({ input: val }),
        });
        const data = await res.json();
        const predictions: GooglePrediction[] =
          data.suggestions?.map((s: { placePrediction: GooglePrediction }) => s.placePrediction) ?? [];
        setSuggestions(predictions);
        setShowDropdown(predictions.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  const handleSelectSuggestion = async (item: GooglePrediction) => {
    setAddressInput(item.text.text);
    setSuggestions([]);
    setShowDropdown(false);
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${item.placeId}`,
        {
          headers: {
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            "X-Goog-FieldMask": "addressComponents,location,formattedAddress",
          },
        }
      );
      const place = await res.json();
      const comps: Array<{ longText: string; types: string[] }> = place.addressComponents ?? [];
      const get = (...types: string[]) =>
        comps.find((c) => types.some((t) => c.types.includes(t)))?.longText ?? "";

      setStreet([get("street_number"), get("route")].filter(Boolean).join(" "));
      setCity(get("locality") || get("postal_town") || get("sublocality_level_1") || get("administrative_area_level_2"));
      setState(get("administrative_area_level_1"));
      setPostalCode(get("postal_code"));
      setCountry(get("country"));
      setLatitude(String(place.location?.latitude ?? ""));
      setLongitude(String(place.location?.longitude ?? ""));
      setAddressInput(place.formattedAddress ?? item.text.text);
    } catch {
      // keep typed address as-is
    } finally {
      setIsSearching(false);
    }
    clearError("address");
  };

  /* ── Image handlers ── */
  const handleImageAdd = (files: File[]) => {
    setImageFiles((p) => [...p, ...files]);
    setImagePreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
  };
  const removeImage = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles((p) => p.filter((_, i) => i !== idx));
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
  };
  const removeExistingImage = (idx: number) => {
    setExistingImages((p) => p.filter((_, i) => i !== idx));
  };

  /* ── Video handlers ── */
  const handleVideoSelect = (file: File) => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setExistingVideoUrl("");
  };
  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");
  };
  const removeExistingVideo = () => setExistingVideoUrl("");

  /* ── Landmark helpers ── */
  const addLandmark = () => setLandmarks([...landmarks, { name: "", distanceInKm: 0 }]);
  const removeLandmark = (i: number) => setLandmarks(landmarks.filter((_, idx) => idx !== i));
  const updateLandmark = (i: number, field: keyof Landmark, val: string | number) => {
    const updated = [...landmarks];
    updated[i] = { ...updated[i], [field]: val };
    setLandmarks(updated);
  };

  const toggleAmenity = (amenity: string) =>
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );

  /* ── Submit ── */
  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Property title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price) newErrors.price = "Price is required";
    if (!totalArea) newErrors.totalArea = "Total area is required";
    if (!landArea) newErrors.landArea = "Land area is required";
    if (!availableFrom) newErrors.availableFrom = "Available from date is required";
    if (amenities.length === 0) newErrors.amenities = "Please select at least one amenity";
    if (!street && !city && !country) newErrors.address = "Please search and select a location";
    if (!landmarks.some((lm) => lm.name.trim())) newErrors.landmarks = "Please add at least one nearby landmark";
    if (existingImages.length === 0 && imageFiles.length === 0)
      newErrors.images = "At least one property image is required";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    const fd = new FormData();
    fd.append("structureType", structureType);
    fd.append("title", title);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("currency", currency);
    fd.append("purpose", purpose);
    fd.append("bedrooms", String(bedrooms));
    fd.append("bathrooms", String(bathrooms));
    fd.append("garage", String(garage));
    if (totalArea) fd.append("totalArea", totalArea);
    if (landArea) fd.append("landArea", landArea);
    if (yearBuilt) fd.append("yearBuilt", yearBuilt);
    if (availableFrom) fd.append("availableFrom", new Date(availableFrom).toISOString());

    fd.append("address", JSON.stringify({ street, city, state, postalCode, country }));
    fd.append("amenities", JSON.stringify(amenities));

    if (latitude && longitude)
      fd.append("location", JSON.stringify({ type: "Point", coordinates: [Number(longitude), Number(latitude)] }));

    const validLandmarks = landmarks
      .filter((lm) => lm.name.trim())
      .map((lm) => ({ name: lm.name.trim(), distanceInKm: Number(lm.distanceInKm) }));
    if (validLandmarks.length > 0) fd.append("landmarks", JSON.stringify(validLandmarks));

    imageFiles.forEach((f) => fd.append("image", f));
    if (videoFile) fd.append("media", videoFile);

    try {
      if (isEditMode) {
        await updateProperty({ propertyId, formData: fd }).unwrap();
        toast.success("Listing updated successfully!");
        if (onCancel) onCancel();
        else router.push("/property-management/listing");
      } else {
        await createProperty(fd).unwrap();
        toast.success("Listing created successfully!");
        router.push("/property-management/listing");
      }
    } catch (error: unknown) {
      const err = error as { name?: string; data?: { message?: string } };
      if (err?.name === "AbortError") toast.error("Request timed out — please try again.");
      else toast.error(err?.data?.message || `Failed to ${isEditMode ? "update" : "create"} listing`);
    }
  };

  const handleCancel = () => { if (onCancel) onCancel(); else router.push("/property-management/listing"); };
  const addressFilled = !!(street || city || country);
  const totalImageCount = existingImages.length + imagePreviews.length;

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pb-4">

        {/* ── Basic Information ── */}
        <Section title="Basic Information" delay={0.05}>
          <Field label="Property Title" required error={errors.title}>
            <Input
              className={inputCls}
              style={{ ...inputStyle, ...(errors.title ? { borderColor: "#EF4444" } : {}) }}
              placeholder="e.g. Lakeview Haven, Lake Tahoe"
              value={title}
              onChange={(e) => { setTitle(e.target.value); clearError("title"); }}
            />
          </Field>

          <Field label="Description" required error={errors.description}>
            <Textarea
              className="rounded-lg border text-sm px-4 py-3 min-h-[110px] resize-none focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
              style={{ ...inputStyle, ...(errors.description ? { borderColor: "#EF4444" } : {}) }}
              placeholder="Describe the property's unique selling points..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearError("description"); }}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Structure Type">
              <Select value={structureType} onValueChange={setStructureType}>
                <SelectTrigger className="h-11 w-full rounded-lg text-sm border" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRUCTURE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Purpose" required>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="h-11 w-full rounded-lg text-sm border" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for_rent">For Rent</SelectItem>
                  <SelectItem value="for_sale">For Sale</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Price" required error={errors.price}>
              <Input
                className={inputCls}
                style={{ ...inputStyle, ...(errors.price ? { borderColor: "#EF4444" } : {}) }}
                type="number" placeholder="25000"
                value={price}
                onChange={(e) => { setPrice(e.target.value); clearError("price"); }}
              />
            </Field>
          </div>
        </Section>

        {/* ── Property Features ── */}
        <Section title="Property Features" delay={0.1}>
          <div className="flex gap-4">
            <Counter label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
            <Counter label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
            <Counter label="Garage" value={garage} onChange={setGarage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Area (sqft)" required error={errors.totalArea}>
              <Input
                className={inputCls}
                style={{ ...inputStyle, ...(errors.totalArea ? { borderColor: "#EF4444" } : {}) }}
                type="number" placeholder="Input total area"
                value={totalArea}
                onChange={(e) => { setTotalArea(e.target.value); clearError("totalArea"); }}
              />
            </Field>
            <Field label="Land Area (sqft)" required error={errors.landArea}>
              <Input
                className={inputCls}
                style={{ ...inputStyle, ...(errors.landArea ? { borderColor: "#EF4444" } : {}) }}
                type="number" placeholder="Input land area"
                value={landArea}
                onChange={(e) => { setLandArea(e.target.value); clearError("landArea"); }}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year Built">
              <Input className={inputCls} style={inputStyle} type="number" placeholder="2022"
                value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} />
            </Field>
            <Field label="Available From" required error={errors.availableFrom}>
              <Input
                className={inputCls}
                style={{ ...inputStyle, ...(errors.availableFrom ? { borderColor: "#EF4444" } : {}) }}
                type="date"
                value={availableFrom}
                onChange={(e) => { setAvailableFrom(e.target.value); clearError("availableFrom"); }}
              />
            </Field>
          </div>
        </Section>

        {/* ── Amenities ── */}
        <Section title="Amenities" delay={0.15}>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium flex items-center gap-1" style={{ color: "#2C2E33" }}>
              Select Amenities <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {AMENITIES_LIST.map((amenity) => {
                const checked = amenities.includes(amenity);
                return (
                  <label key={amenity}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors"
                    style={{ borderColor: checked ? "#F1913D" : "#F2F2F2", backgroundColor: checked ? "#FEF0E4" : "#FAFAFA" }}>
                    <Checkbox checked={checked}
                      onCheckedChange={() => { toggleAmenity(amenity); clearError("amenities"); }}
                      className="border-[#F1913D] data-[state=checked]:bg-[#F1913D] data-[state=checked]:border-[#F1913D]" />
                    <span className="text-sm font-medium" style={{ color: checked ? "#F1913D" : "#6C757D" }}>
                      {amenity}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.amenities && (
              <p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: "#EF4444" }}>
                <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
                {errors.amenities}
              </p>
            )}
          </div>
        </Section>

        {/* ── Address — Google Places autocomplete ── */}
        <Section title="Address" delay={0.2}>
          <Field label="Search Location" required error={errors.address}>
            <div className="relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: errors.address ? "#EF4444" : "#F1913D" }} />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin"
                    style={{ color: "#6C757D" }} />
                )}
                <input
                  value={addressInput}
                  onChange={(e) => { handleAddressInput(e); clearError("address"); }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  placeholder="Type a city, street or area…"
                  autoComplete="off"
                  className="w-full h-11 rounded-lg border text-sm pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#F1913D] focus:border-[#F1913D]"
                  style={{ ...inputStyle, ...(errors.address ? { borderColor: "#EF4444" } : {}) }}
                />
              </div>

              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg overflow-hidden z-50"
                  style={{ borderColor: "#F2F2F2" }}>
                  {suggestions.map((item) => (
                    <button
                      key={item.placeId}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 flex items-start gap-2.5 border-b last:border-0 transition-colors"
                      style={{ borderColor: "#F9FAFB" }}
                    >
                      <MapPin className="w-3.5 h-3.5 mt-1 shrink-0" style={{ color: "#F1913D" }} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium line-clamp-1" style={{ color: "#2C2E33" }}>
                          {item.structuredFormat?.mainText.text ?? item.text.text}
                        </span>
                        {item.structuredFormat?.secondaryText && (
                          <span className="text-xs line-clamp-1" style={{ color: "#6C757D" }}>
                            {item.structuredFormat.secondaryText.text}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {addressFilled && (
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6C757D" }}>
                Parsed Address
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  { label: "Street", value: street },
                  { label: "City", value: city },
                  { label: "State", value: state },
                  { label: "Postal Code", value: postalCode },
                  { label: "Country", value: country },
                  {
                    label: "Coordinates", value: latitude && longitude
                      ? `${parseFloat(latitude).toFixed(5)}, ${parseFloat(longitude).toFixed(5)}`
                      : "—"
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-xs" style={{ color: "#6C757D" }}>{label}</span>
                    <span className="font-medium" style={{ color: "#2C2E33" }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ── Nearby Landmarks ── */}
        <Section title="Nearby Landmarks" delay={0.25}>
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium flex items-center gap-1" style={{ color: "#2C2E33" }}>
              Landmarks <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {landmarks.map((lm, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input className={inputCls + " flex-1"} style={inputStyle}
                    placeholder="e.g. Central Park" value={lm.name}
                    onChange={(e) => { updateLandmark(i, "name", e.target.value); if (e.target.value.trim()) clearError("landmarks"); }} />
                  <Input className={inputCls + " w-32"} style={inputStyle}
                    type="number" step="0.1" placeholder="km" value={lm.distanceInKm || ""}
                    onChange={(e) => updateLandmark(i, "distanceInKm", parseFloat(e.target.value) || 0)} />
                  <button type="button" onClick={() => removeLandmark(i)}
                    disabled={landmarks.length === 1}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border transition-colors hover:bg-red-50 disabled:opacity-30 cursor-pointer shrink-0"
                    style={{ borderColor: "#F2F2F2" }}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
            {errors.landmarks && (
              <p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: "#EF4444" }}>
                <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
                {errors.landmarks}
              </p>
            )}
            <button type="button" onClick={addLandmark}
              className="flex items-center gap-2 text-sm font-medium mt-1 cursor-pointer"
              style={{ color: "#F1913D" }}>
              <Plus className="w-4 h-4" /> Add Landmark
            </button>
          </div>
        </Section>

        {/* ── Media Upload ── */}
        <Section title="Media Upload" delay={0.3}>

          {/* Property Images */}
          <Field label="Property Images" required error={errors.images}>
            {totalImageCount > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((url, idx) => (
                  <div key={`ex-${idx}`} className="relative group rounded-lg overflow-hidden border bg-gray-50"
                    style={{ borderColor: "#E5E7EB", aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={serverImgUrl(url)} alt={`img-${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
                {imagePreviews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative group rounded-lg overflow-hidden border bg-gray-50"
                    style={{ borderColor: "#E5E7EB", aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`new-${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
                <button type="button"
                  onClick={() => { if (imageRef.current) { imageRef.current.value = ""; imageRef.current.click(); } }}
                  className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 hover:bg-orange-50 transition-colors"
                  style={{ borderColor: "#F1913D", aspectRatio: "16/9" }}>
                  <Plus className="w-5 h-5" style={{ color: "#F1913D" }} />
                  <span className="text-xs font-medium" style={{ color: "#F1913D" }}>Add More</span>
                </button>
              </div>
            ) : (
              <div onClick={() => imageRef.current?.click()}
                className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 min-h-[160px] cursor-pointer hover:border-[#F1913D] hover:bg-[#FEF0E4]/30 transition-colors"
                style={{ borderColor: errors.images ? "#EF4444" : "#E5E7EB", backgroundColor: "#FAFAFA" }}>
                <CloudUpload className="w-9 h-9" style={{ color: errors.images ? "#EF4444" : "#F1913D" }} />
                <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Click to Upload Images</p>
                <p className="text-xs text-center max-w-[240px]" style={{ color: "#6C757D" }}>
                  JPG, PNG or WebP — select multiple at once
                </p>
              </div>
            )}
            <input ref={imageRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => {
                const f = Array.from(e.target.files || []);
                if (f.length) { handleImageAdd(f); clearError("images"); }
                e.target.value = "";
              }} />
          </Field>

          {/* Video Upload (single) */}
          <Field label="Property Video" optional>
            {existingVideoUrl && !videoPreview ? (
              <div className="relative group rounded-lg overflow-hidden border bg-gray-900"
                style={{ borderColor: "#E5E7EB", aspectRatio: "16/9", maxWidth: "360px" }}>
                <video src={serverImgUrl(existingVideoUrl)} className="w-full h-full object-cover"
                  muted playsInline
                  onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLVideoElement).pause();
                    (e.currentTarget as HTMLVideoElement).currentTime = 0;
                  }} />
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white pointer-events-none">
                  VIDEO
                </div>
                <button type="button" onClick={removeExistingVideo}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : videoPreview ? (
              <div className="relative group rounded-lg overflow-hidden border bg-gray-900"
                style={{ borderColor: "#E5E7EB", aspectRatio: "16/9", maxWidth: "360px" }}>
                <video src={videoPreview} className="w-full h-full object-cover"
                  muted playsInline
                  onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLVideoElement).pause();
                    (e.currentTarget as HTMLVideoElement).currentTime = 0;
                  }} />
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white pointer-events-none">
                  VIDEO
                </div>
                <button type="button" onClick={removeVideo}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <div onClick={() => videoRef.current?.click()}
                className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer hover:border-[#F1913D] hover:bg-[#FEF0E4]/30 transition-colors"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#FAFAFA" }}>
                <CloudUpload className="w-8 h-8" style={{ color: "#6C757D" }} />
                <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Click to Upload Video</p>
                <p className="text-xs" style={{ color: "#6C757D" }}>MP4, MOV or WebM — optional, hover to preview after upload</p>
              </div>
            )}
            <input ref={videoRef} type="file" accept="video/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoSelect(f); e.target.value = ""; }} />
          </Field>
        </Section>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="flex items-center justify-end gap-3 pt-4 pb-2 shrink-0">
        <Button variant="outline" onClick={handleCancel}
          className="h-11 px-8 rounded-lg text-sm font-semibold border cursor-pointer hover:bg-gray-50"
          style={{ borderColor: "#F2F2F2", color: "#2C2E33" }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}
          className="h-11 px-8 rounded-lg text-sm font-semibold cursor-pointer shadow-lg shadow-orange-100 flex items-center gap-2"
          style={{ backgroundColor: "#F1913D", color: "#FFFFFF" }}>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading
            ? (isEditMode ? "Updating..." : "Creating...")
            : (isEditMode ? "Update Listing" : "Create Listing")}
        </Button>
      </div>
    </div>
  );
}
