"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Trash2, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useDeleteBlogMutation, useGetBlogsQuery } from "@/features/blog/blogApi";

import {
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { format } from "date-fns";
import toast from 'react-hot-toast';
import { CustomLoading } from '../../hooks/CustomLoading';
import { baseURL } from '../../utils/BaseURL';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import CreateBlogForm from './CreateBlogForm';

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

/* ── Main component ──────────────────────────────────────────── */
export default function BlogManagement() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: blogData, isLoading, isError } = useGetBlogsQuery({ page });
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const blogs: Blog[] = blogData?.data || [];
  const pagination = blogData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  const handleViewDetails = (blog: Blog) => {
    setSelectedBlog(blog);
    setActiveImageIndex(0);
    setIsDetailsOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBlog) return;
    try {
      await deleteBlog({ blogId: selectedBlog._id }).unwrap();
      toast.success("Blog deleted successfully");
      setIsDeleteOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete blog");
    }
  };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load blogs</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "#2C2E33" }}>Blog Management</h2>
          <p className="text-sm mt-1" style={{ color: "#6C757D" }}>
            Manage and organize all your blog posts
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 h-11 px-6 rounded-lg text-base font-semibold text-white cursor-pointer transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "#F1913D" }}
            >
              <Plus className="w-5 h-5" /> Create New Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[100vw] mt-5 h-full p-0 border-none bg-black/20 backdrop-blur-sm [&>button]:hidden shadow-none">
            <CreateBlogForm onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {blogs.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-none shadow-sm bg-white p-0 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FEF0E4" }}>
                  <Plus className="w-7 h-7" style={{ color: "#F1913D" }} />
                </div>
                <p className="text-lg font-semibold" style={{ color: "#2C2E33" }}>No blogs found</p>
                <p className="text-sm" style={{ color: "#6C757D" }}>Create your first blog post to get started</p>
              </div>
            </Card>
          </div>
        ) : (
          blogs.map((b: Blog, index: number) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full p-0">
                {/* Blog Image */}
                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                  {b.images?.[0] ? (
                    <Image
                      src={baseURL + b.images[0]}
                      alt={b.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F8F9FA" }}>
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Status Badge on Image */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize backdrop-blur-md"
                      style={{
                        backgroundColor: b.status === "published" ? "rgba(232, 245, 233, 0.9)" : "rgba(254, 240, 228, 0.9)",
                        color: b.status === "published" ? "#2B9724" : "#F1913D"
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleViewDetails(b)}
                      className="p-2.5 bg-white/90 hover:bg-white rounded-full transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" style={{ color: "#F1913D" }} />
                    </button>
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-2.5 bg-white/90 hover:bg-white rounded-full transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
                      title="Edit Blog"
                    >
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(b)}
                      className="p-2.5 bg-white/90 hover:bg-white rounded-full transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
                      title="Delete Blog"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Category Tag */}
                  {b.category && (
                    <span
                      className="inline-flex self-start items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider mb-3"
                      style={{ backgroundColor: "#F0EDFF", color: "#6C5CE7" }}
                    >
                      {b.category}
                    </span>
                  )}

                  {/* Title */}
                  <h3
                    className="text-base font-semibold leading-snug line-clamp-2 mb-3 group-hover:text-[#F1913D] transition-colors duration-200 cursor-pointer"
                    style={{ color: "#2C2E33" }}
                    onClick={() => handleViewDetails(b)}
                  >
                    {b.title}
                  </h3>

                  {/* Slug */}
                  <p className="text-xs mb-4 line-clamp-1" style={{ color: "#9CA3AF" }}>
                    {b.slug}
                  </p>

                  {/* Spacer to push meta to bottom */}
                  <div className="flex-1" />

                  {/* Divider */}
                  <div className="border-t mb-3" style={{ borderColor: "#F2F2F2" }} />

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs" style={{ color: "#6C757D" }}>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-medium">{b.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{b.publishDate ? format(new Date(b.publishDate), "MMM dd, yyyy") : "N/A"}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {TOTAL > 0 && (
        <Card className="border-none shadow-sm bg-white p-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 px-6 py-4">
            <p className="text-sm" style={{ color: "#6C757D" }}>
              Showing <span className="font-semibold" style={{ color: "#2C2E33" }}>{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}</span> of <span className="font-semibold" style={{ color: "#2C2E33" }}>{TOTAL}</span> entries
            </p>

            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors" style={{ color: "#2C2E33" }}><ChevronLeft className="w-4 h-4" /> Previous</button>
              {PAGES.map((p, i) => (
                <button key={i} onClick={() => setPage(Number(p))} className="w-8 h-8 text-sm rounded-lg font-medium transition-colors cursor-pointer" style={page === p ? { backgroundColor: "#F1913D", color: "#FFFFFF" } : { color: "#2C2E33", backgroundColor: "transparent" }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(LAST_PG, p + 1))} disabled={page === LAST_PG || LAST_PG === 0} className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors" style={{ color: "#2C2E33" }}>Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Edit Modal ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-[100vw] mt-5 h-full p-0 border-none bg-black/20 backdrop-blur-sm [&>button]:hidden shadow-none">
          <CreateBlogForm initialData={selectedBlog || undefined} onCancel={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Details Modal ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Blog Details</DialogTitle>
          </DialogHeader>

          {selectedBlog && (
            <div className="space-y-6 py-4">
              {/* Image Gallery */}
              {selectedBlog.images?.length > 0 && (
                <div className="space-y-2">
                  {/* Main image */}
                  <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={baseURL + selectedBlog.images[activeImageIndex]}
                      alt={selectedBlog.title}
                      fill
                      className="object-cover"
                    />
                    {selectedBlog.images.length > 1 && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/50 text-white">
                        {activeImageIndex + 1} / {selectedBlog.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {selectedBlog.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedBlog.images.map((img: string, i: number) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                          style={{
                            borderColor: i === activeImageIndex ? "#F1913D" : "transparent",
                          }}
                        >
                          <Image
                            src={baseURL + img}
                            alt={`thumb-${i}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title and Meta */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedBlog.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>By <span className="font-semibold text-gray-900">{selectedBlog.authorName}</span></span>
                  <span>Published on <span className="font-semibold text-gray-900">{format(new Date(selectedBlog.publishDate), "PPP")}</span></span>
                  <span>Category: <span className="font-semibold text-gray-900">{selectedBlog.category}</span></span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
                  style={{
                    backgroundColor: selectedBlog.status === "published" ? "#E8F5E9" : "#FEF0E4",
                    color: selectedBlog.status === "published" ? "#2B9724" : "#F1913D"
                  }}>
                  {selectedBlog.status}
                </span>
              </div>

              {/* Tags */}
              {selectedBlog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedBlog.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* SEO Info */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <p className="text-sm font-bold text-gray-700">SEO Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Meta Title</p>
                    <p className="text-sm">{selectedBlog.seo?.metaTitle || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Meta Description</p>
                    <p className="text-sm">{selectedBlog.seo?.metaDescription || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="border-t pt-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Content Preview</p>
                <div
                  className="prose prose-sm max-w-none text-gray-700 line-clamp-[10]"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              <span className="font-bold text-gray-900 mx-1">&quot;{selectedBlog?.title}&quot;</span>
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
