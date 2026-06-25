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
  "h-11 rounded-xl border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

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

  /* ── Error state ── */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setFieldErrors((prev) => ({ ...prev, image: "" }));
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
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!formData.title) errors.title = "Title is required";
    if (!isEdit && !selectedFile) errors.image = "Image is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the errors before submitting");
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
      const err = error as { data?: { message?: string; errorMessages?: Array<{ path: string; message: string }> } };
      
      if (err?.data?.errorMessages) {
        const apiErrors: Record<string, string> = {};
        err.data.errorMessages.forEach((item) => {
          apiErrors[item.path] = item.message;
        });
        setFieldErrors(apiErrors);
        toast.error(err.data.message || "Validation Error");
      } else {
        toast.error(err?.data?.message || `Failed to ${isEdit ? "update" : "create"} advertisement`);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl relative flex flex-col max-h-[90vh] shadow-2xl overflow-hidden border border-[#F2F2F2]">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-20">
        <h2 className="text-xl font-bold" style={{ color: "#2C2E33" }}>
          {isEdit ? "Edit Advertisement" : "Create New Advertisement"}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar bg-[#FDFDFD]">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#4B5563]">Title</Label>
            <Input
              className={`${inputCls} ${fieldErrors.title ? "border-red-500" : ""}`}
              style={inputStyle}
              placeholder="e.g. Big Sale"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: "" });
              }}
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#4B5563]">Image</Label>

            {previewSrc ? (
              <div
                className={`relative group rounded-xl overflow-hidden border-2 bg-gray-50 transition-all ${fieldErrors.image ? "border-red-500" : "border-[#E5E7EB]"
                  }`}
                style={{ aspectRatio: "16/9" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-gray-900 shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    Change Image
                  </button>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 rounded-lg bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 min-h-[220px] cursor-pointer transition-all hover:bg-orange-50/20 bg-[#FAFAFA] ${fieldErrors.image ? "border-red-500" : "border-[#E5E7EB]"
                  }`}
              >
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                  <CloudUpload className="w-8 h-8" style={{ color: "#F1913D" }} />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold" style={{ color: "#2C2E33" }}>
                    Click to upload advertisement image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 1200 x 675 pixels</p>
                </div>
              </div>
            )}
            {fieldErrors.image && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.image}</p>
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
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#4B5563]">Description</Label>
            <Textarea
              className={`rounded-xl border text-sm p-4 min-h-[120px] resize-none transition-all focus:ring-2 focus:ring-orange-100 ${fieldErrors.description ? "border-red-500" : ""
                }`}
              style={inputStyle}
              placeholder="Brief description of the advertisement..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
              }}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.description}</p>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#4B5563]">Link</Label>
            <Input
              className={`${inputCls} ${fieldErrors.link ? "border-red-500" : ""}`}
              style={inputStyle}
              placeholder="https://example.com"
              value={formData.link}
              onChange={(e) => {
                setFormData({ ...formData, link: e.target.value });
                if (fieldErrors.link) setFieldErrors({ ...fieldErrors, link: "" });
              }}
            />
            {fieldErrors.link && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.link}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#4B5563]">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => {
                setFormData({ ...formData, status: v as Advertisement["status"] });
                if (fieldErrors.status) setFieldErrors({ ...fieldErrors, status: "" });
              }}
            >
              <SelectTrigger
                className={`h-11 rounded-xl w-full border py-6 ${fieldErrors.status ? "border-red-500" : ""
                  }`}
                style={inputStyle}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.status && (
              <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.status}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-20">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 px-8 rounded-xl font-bold border-2 hover:bg-gray-50 transition-all text-[#2C2E33]"
            style={{ borderColor: "#F2F2F2" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 px-8 rounded-xl font-bold text-white shadow-lg hover:shadow-orange-200 transition-all"
            style={{ backgroundColor: "#F1913D" }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              isEdit ? "Save Changes" : "Create Advertisement"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
