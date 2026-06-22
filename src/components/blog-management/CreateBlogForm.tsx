"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Publish date handled automatically; UI removed
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
import { format } from "date-fns";
import { CloudUpload, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

import {
  useCreateBlogMutation,
  useGetAllCategoryQuery,
  useUpdateBlogMutation,
} from "@/features/blog/blogApi";
import { baseURL } from "../../utils/BaseURL";
import TiptapEditor from "./TiptapEditor";

const inputCls =
  "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

/* ── Types ─────────────────────────────────────────────────── */
interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  authorName: string;
  category: string;
  publishDate: string;
  status: "published" | "draft" | "archived";
  images: string[];
  tags: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export default function CreateBlogForm({
  onCancel,
  initialData,
}: {
  onCancel?: () => void;
  initialData?: Blog;
}) {
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const { data: categoryData } = useGetAllCategoryQuery({ page: 1 });

  const isLoading = isCreating || isUpdating;
  const isEdit = !!initialData;

  const categories: string[] = categoryData?.data || [];

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    authorName: initialData?.authorName || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    status: initialData?.status || "draft",
    seo: {
      metaTitle: initialData?.seo?.metaTitle || "",
      metaDescription: initialData?.seo?.metaDescription || "",
    },
  });

  // publish date will be set automatically to today's date on submit
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  /* ── Multiple image state ── */
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [blobPreviews, setBlobPreviews] = useState<string[]>([]);
  const existingImages: string[] = initialData?.images || [];
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Tag handlers ── */
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = (t: string) => setTags(tags.filter((tag) => tag !== t));

  /* ── Image handlers ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    setBlobPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(blobPreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setBlobPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.authorName) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("authorName", formData.authorName);
    payload.append("content", formData.content);
    payload.append("category", formData.category);
    payload.append("status", formData.status);
    payload.append("publishDate", format(new Date(), "yyyy-MM-dd"));

    tags.forEach((tag, index) => payload.append(`tags[${index}]`, tag));

    payload.append("seo[metaTitle]", formData.seo.metaTitle || formData.title);
    payload.append("seo[metaDescription]", formData.seo.metaDescription || "");

    // Append each image with the same "image" key (keeping original field name)
    selectedFiles.forEach((file) => payload.append("image", file));

    try {
      if (isEdit) {
        await updateBlog({ blogId: initialData._id, formData: payload }).unwrap();
        toast.success("Blog updated successfully!");
      } else {
        await createBlog(payload).unwrap();
        toast.success("Blog published successfully!");
      }
      if (onCancel) onCancel();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || `Failed to ${isEdit ? "update" : "publish"} blog`);
    }
  };

  const allPreviews = [
    ...existingImages.map((url) => ({ src: baseURL + url, isExisting: true, index: -1 })),
    ...blobPreviews.map((url, i) => ({ src: url, isExisting: false, index: i })),
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#F8F7FC] p-6 rounded-xl relative overflow-y-auto max-h-[95vh] scrollbar-hide">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col - Basic Info + Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>
              {isEdit ? "Edit Blog" : "Basic Information"}
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Blog Title</Label>
              <Input
                className={inputCls}
                style={inputStyle}
                placeholder="e.g. Top 5 Home Renovation Trends"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Multiple Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Featured Images
                {allPreviews.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    ({allPreviews.length} {allPreviews.length === 1 ? "image" : "images"})
                  </span>
                )}
              </Label>

              {/* Preview grid — shown when there are images */}
              {allPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-1">
                  {allPreviews.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden border bg-gray-50"
                      style={{ borderColor: "#E5E7EB", aspectRatio: "16/9" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.src}
                        alt={`preview-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      {!img.isExisting && (
                        <button
                          type="button"
                          onClick={() => removeNewImage(img.index)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add more tile */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors hover:bg-orange-50"
                    style={{ borderColor: "#F1913D", aspectRatio: "16/9" }}
                  >
                    <Plus className="w-5 h-5" style={{ color: "#F1913D" }} />
                    <span className="text-xs font-medium" style={{ color: "#F1913D" }}>
                      Add More
                    </span>
                  </button>
                </div>
              )}

              {/* Empty drop zone */}
              {allPreviews.length === 0 && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 min-h-[180px] cursor-pointer transition-colors hover:bg-orange-50/30 bg-[#FAFAFA]"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <CloudUpload className="w-10 h-10" style={{ color: "#F1913D" }} />
                  <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                    Upload Featured Images
                  </p>
                  <p className="text-xs text-center text-gray-400">
                    Select one or more JPG, PNG or WebP files
                  </p>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                multiple
              />
            </div>

            {/* Tiptap Rich Text Editor */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Content</Label>
              <TiptapEditor
                content={formData.content}
                onChange={(richText) => setFormData({ ...formData, content: richText })}
              />
            </div>
          </div>

          {/* Mobile actions */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex justify-end gap-3 lg:hidden">
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
              {isEdit ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Right Col - Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-5">
            <h2 className="text-lg font-semibold border-b pb-3" style={{ color: "#2C2E33" }}>
              Publishing Settings
            </h2>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as Blog["status"] })}
              >
                <SelectTrigger className="h-11 rounded-sm w-full py-5 border" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category — loaded from API */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger className="h-11 rounded-sm w-full py-5 border" style={inputStyle}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-400">Loading categories...</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Author Name</Label>
              <Input
                className={inputCls}
                style={inputStyle}
                placeholder="Sarah Jenkins"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              />
            </div>

            {/* Publish date removed from UI — set automatically on submit */}

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Meta Title</Label>
              <Input
                className={inputCls}
                style={inputStyle}
                placeholder="Search engine title"
                value={formData.seo.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Meta Description</Label>
              <Textarea
                className="rounded-sm border text-sm p-4 min-h-[100px] resize-none"
                style={inputStyle}
                placeholder="Brief summary for search results..."
                value={formData.seo.metaDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, metaDescription: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#FEF0E4] text-[#F1913D] border-[#F1913D]/20"
                  >
                    {t}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(t)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                className={inputCls}
                style={inputStyle}
                placeholder="Press Enter to add tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm hidden lg:flex justify-stretch gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-11 rounded-sm font-semibold border hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#F2F2F2" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-sm font-semibold text-white shadow-lg shadow-orange-100"
              style={{ backgroundColor: "#F1913D" }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEdit ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
