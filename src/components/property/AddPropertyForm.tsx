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
import { motion } from "framer-motion";
import { CloudUpload, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

/* ── Amenity checkboxes ─────────────────────────────────────── */
const AMENITIES = ["Floor", "Floor", "Floor", "Floor", "Floor"];

/* ── Section wrapper ────────────────────────────────────────── */
function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
    >
      <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

/* ── Counter input ──────────────────────────────────────────── */
function Counter({ label }: { label: string }) {
  const [val, setVal] = useState(0);
  return (
    <div className="flex flex-col gap-2 flex-1">
      <Label className="text-sm font-medium" style={{ color: "#6C757D" }}>
        {label}
      </Label>
      <div
        className="flex items-center justify-between rounded-lg border px-4 py-2 gap-3"
        style={{ borderColor: "#F2F2F2" }}
      >
        <button
          type="button"
          onClick={() => setVal((v) => Math.max(0, v - 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-gray-100"
          style={{ backgroundColor: "#F2F2F2" }}
        >
          <Minus className="w-3 h-3" style={{ color: "#2C2E33" }} />
        </button>
        <span className="text-sm font-semibold w-4 text-center" style={{ color: "#2C2E33" }}>
          {val}
        </span>
        <button
          type="button"
          onClick={() => setVal((v) => v + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          style={{ backgroundColor: "#F1913D" }}
        >
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}

/* ── Field wrapper ──────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium" style={{ color: "#2C2E33" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  "h-11 rounded-lg border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

/* ── Main component ──────────────────────────────────────────── */
export default function AddPropertyForm({ onCancel }: { onCancel?: () => void }) {
  const [amenities, setAmenities] = useState<boolean[]>(AMENITIES.map(() => true));
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    toast.success("Property listing added successfully!");
    if (onCancel) onCancel();
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Sticky Header */}


      {/* Main Form Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
        {/* Basic Information */}
        <Section title="Basic Information" delay={0.05}>
          <Field label="Property Title">
            <Input
              className={inputCls}
              style={inputStyle}
              placeholder="e.g. Modern Minimalist Penthouse in Downtown"
            />
          </Field>

          <Field label="Description">
            <Textarea
              className="rounded-sm border text-sm px-4 py-3 min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
              style={inputStyle}
              placeholder="Tell us about the property's unique selling points..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Property Type">
              <Select defaultValue="Apartment">
                <SelectTrigger className="h-11 w-full rounded-sm text-sm border" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Apartment", "Villa", "Office", "Studio", "Penthouse"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Category">
              <Select defaultValue="Rent">
                <SelectTrigger className="h-11 w-full rounded-sm text-sm border" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Rent", "Sale", "Featured"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Price (ETB)">
            <Input
              className={`${inputCls} w-full`}
              style={inputStyle}
              placeholder="2,500"
              type="number"
            />
          </Field>
        </Section>

        {/* Location Details */}
        <Section title="Location Details" delay={0.1}>
          <Field label="Street Address">
            <Input className={inputCls} style={inputStyle} placeholder="123 Luxury Lane" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <Input className={inputCls} style={inputStyle} placeholder="New York" />
            </Field>
            <Field label="Neighborhood">
              <Input className={inputCls} style={inputStyle} placeholder="Manhattan" />
            </Field>
          </div>
        </Section>

        {/* Property Features */}
        <Section title="Property Features" delay={0.15}>
          <div className="flex gap-4">
            <Counter label="Bedrooms" />
            <Counter label="Bathrooms" />
            <Counter label="Parking" />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium" style={{ color: "#2C2E33" }}>
              Amenities and features
            </Label>
            <div className="flex flex-wrap gap-3">
              {amenities.map((checked, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer select-none transition-colors"
                  style={{
                    borderColor: checked ? "#F1913D" : "#F2F2F2",
                    backgroundColor: checked ? "#FEF0E4" : "#FAFAFA",
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => {
                      const next = [...amenities];
                      next[i] = Boolean(v);
                      setAmenities(next);
                    }}
                    className="border-[#F1913D] data-[state=checked]:bg-[#F1913D] data-[state=checked]:border-[#F1913D]"
                  />
                  <span className="text-sm font-medium" style={{ color: checked ? "#F1913D" : "#6C757D" }}>
                    Floor
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Media Upload */}
        <Section title="Media Upload" delay={0.2}>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium" style={{ color: "#2C2E33" }}>
              Uploaded Image
            </Label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className="relative border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 min-h-[180px] cursor-pointer transition-colors"
              style={{
                borderColor: dragOver ? "#F1913D" : "#E5E7EB",
                backgroundColor: dragOver ? "#FEF0E4" : "#FAFAFA",
              }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="max-h-40 rounded-sm object-contain" />
              ) : (
                <>
                  <CloudUpload className="w-10 h-10" style={{ color: "#F1913D" }} />
                  <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Drag & Drop Property Images</p>
                  <p className="text-xs text-center max-w-[260px]" style={{ color: "#6C757D" }}>
                    Support JPG, PNG and WebP files. High quality recommended.
                  </p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          <Field label="Video Tour Link (Optional)">
            <Input className={inputCls} style={inputStyle} placeholder="https://youtube.com/watch?v" />
          </Field>
        </Section>
      </div>

      {/* Sticky Footer */}
      <div className="flex items-center justify-end gap-3 p-6 px-8shrink-0">
        <Button
          variant="outline"
          onClick={onCancel}
          className="h-11 px-8 rounded-sm text-sm font-semibold border cursor-pointer hover:bg-gray-50"
          style={{ borderColor: "#F2F2F2", color: "#2C2E33" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="h-11 px-8 rounded-sm text-sm font-semibold cursor-pointer shadow-lg shadow-orange-100"
          style={{ backgroundColor: "#F1913D", color: "#FFFFFF" }}
        >
          Add a New Listing
        </Button>
      </div>
    </div>
  );
}
