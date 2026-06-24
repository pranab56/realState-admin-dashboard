"use client";

import { Button } from "@/components/ui/button";
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
import { CloudUpload, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

import {
  useCreateAdvertisementMutation,
  useUpdateAdvertisementMutation,
} from "@/features/advertisement/advertisementApi";
import { baseURL } from "../../utils/BaseURL";

const inputCls =
  "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

/* ── Types ─────────────────────────────────────────────────── */
interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  status: "active" | "inactive";
}

export default function CreateAdvertisementForm({
  onCancel,
  initialData,
}: {
  onCancel?: () => void;
  initialData?: Advertisement;
}) {
  const [createAdvertisement, { isLoading: isCreating }] = useCreateAdvertisementMutation();
  const [updateAdvertisement, { isLoading: isUpdating }] = useUpdateAdvertisementMutation();

  const isLoading = isCreating || isUpdating;
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    link: initialData?.link || "",
    status: initialData?.status || "active",
  });

  /* ── Image state ── */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [blobPreview, setBlobPreview] = useState<string | null>(null);
  const existingImage: string | undefined = initialData?.image;
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setBlobPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeImage = () => {
    if (blobPreview) URL.revokeObjectURL(blobPreview);
    setSelectedFile(null);
    setBlobPreview(null);
  };

  const previewSrc = blobPreview || (existingImage ? baseURL + existingImage : null);

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isEdit && !selectedFile) {
      toast.error("Please select an image");
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("link", formData.link);
    payload.append("status", formData.status);
    if (selectedFile) payload.append("image", selectedFile);

    try {
      if (isEdit) {
        await updateAdvertisement({ advertisementId: initialData._id, formData: payload }).unwrap();
        toast.success("Advertisement updated successfully!");
      } else {
        await createAdvertisement(payload).unwrap();
        toast.success("Advertisement created successfully!");
      }
      if (onCancel) onCancel();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || `Failed to ${isEdit ? "update" : "create"} advertisement`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#F8F7FC] p-6 rounded-xl relative overflow-y-auto max-h-[95vh] scrollbar-hide">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>
            {isEdit ? "Edit Advertisement" : "Create New Advertisement"}
          </h2>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Title</Label>
            <Input
              className={inputCls}
              style={inputStyle}
              placeholder="e.g. Big Sale"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Image</Label>

            {previewSrc ? (
              <div
                className="relative group rounded-lg overflow-hidden border bg-gray-50"
                style={{ borderColor: "#E5E7EB", aspectRatio: "16/9" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
                {selectedFile && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-1.5 right-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 min-h-[160px] cursor-pointer transition-colors hover:bg-orange-50/30 bg-[#FAFAFA]"
                style={{ borderColor: "#E5E7EB" }}
              >
                <CloudUpload className="w-10 h-10" style={{ color: "#F1913D" }} />
                <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                  Upload Image
                </p>
                <p className="text-xs text-center text-gray-400">JPG, PNG or WebP</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Description</Label>
            <Textarea
              className="rounded-sm border text-sm p-4 min-h-[100px] resize-none"
              style={inputStyle}
              placeholder="Brief description of the advertisement..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Link */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Link</Label>
            <Input
              className={inputCls}
              style={inputStyle}
              placeholder="https://example.com"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v as Advertisement["status"] })}
            >
              <SelectTrigger className="h-11 rounded-sm w-full py-5 border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 px-8 rounded-sm font-semibold border"
            style={{ borderColor: "#F2F2F2" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 px-8 rounded-sm font-semibold text-white"
            style={{ backgroundColor: "#F1913D" }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
