"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteAdvertisementMutation,
  useGetAdvertisementsQuery,
} from "@/features/advertisement/advertisementApi";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { CustomLoading } from "../../hooks/CustomLoading";
import { useMarkPageSeen } from "../../hooks/useMarkPageSeen";
import { useNewItemsTracker } from "../../hooks/useNewItemsTracker";
import { baseURL } from "../../utils/BaseURL";
import NewPulseDot from "../notifications/NewPulseDot";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import CreateAdvertisementForm from "./CreateAdvertisementForm";

/* ── Types ─────────────────────────────────────────────────── */
interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  status: "active" | "inactive";
  createdAt: string;
}

/* ── Status badge ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: "#E8F5E9", color: "#2B9724" },
    inactive: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const { bg, color } = map[s] || map.inactive;
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: bg, color }}
    >
      {s}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function AdvertisementManagement() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  const { data: adData, isLoading, isError } = useGetAdvertisementsQuery({ page }, { pollingInterval: 3000 });
  const [deleteAdvertisement, { isLoading: isDeleting }] = useDeleteAdvertisementMutation();

  const ads: Advertisement[] = adData?.data || [];
  const pagination = adData?.pagination || { total: ads.length, limit: 10, page: 1, totalPage: 1 };

  useMarkPageSeen("advertisement", adData?.pagination?.total ?? ads.length);
  const { isNew, dismiss } = useNewItemsTracker(
    "advertisement",
    ads.map((a) => a._id)
  );

  const handleEdit = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsEditOpen(true);
    dismiss(ad._id);
  };

  const handleDeleteClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAd) return;
    try {
      await deleteAdvertisement({ advertisementId: selectedAd._id }).unwrap();
      toast.success("Advertisement deleted successfully");
      setIsDeleteOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete advertisement");
    }
  };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load advertisements</div>;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "#2C2E33" }}>Advertisement Management</h2>
          <p className="text-sm mt-1" style={{ color: "#6C757D" }}>
            Manage and organize all your advertisements
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 h-11 px-6 rounded-lg text-base font-semibold text-white cursor-pointer transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "#F1913D" }}
            >
              <Plus className="w-5 h-5" /> Create Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[100vw] mt-5 h-full p-0 border-none bg-black/20 backdrop-blur-sm [&>button]:hidden shadow-none">
            <CreateAdvertisementForm onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="border-none shadow-sm bg-white overflow-hidden p-0">
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>Advertisements List</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>Advertisement</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Link</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Created</TableHead>
                <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad._id} style={{ borderColor: "#F2F2F2" }} className="hover:bg-gray-50/60 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-10 rounded-md overflow-hidden shrink-0 bg-gray-100">
                        {ad.image ? (
                          <Image
                            src={ad.image.startsWith("http") ? ad.image : baseURL + ad.image}
                            alt={ad.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "#2C2E33" }}>
                          {isNew(ad._id) && <NewPulseDot />}
                          {ad.title}
                        </p>
                        {ad.description && (
                          <p className="text-xs line-clamp-1 max-w-[220px]" style={{ color: "#6C757D" }}>{ad.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {ad.link ? (
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm hover:underline"
                        style={{ color: "#F1913D" }}
                      >
                        Visit <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-sm" style={{ color: "#6C757D" }}>N/A</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={ad.status} />
                  </TableCell>

                  <TableCell>
                    <span className="text-sm" style={{ color: "#2C2E33" }}>
                      {ad.createdAt ? format(new Date(ad.createdAt), "MMM dd, yyyy") : "N/A"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-blue-500"
                        title="Edit Advertisement"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ad)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-red-500"
                        title="Delete Advertisement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {ads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-sm" style={{ color: "#6C757D" }}>
                    No advertisements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {TOTAL > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#F2F2F2" }}>
            <p className="text-sm" style={{ color: "#6C757D" }}>
              Showing{" "}
              <span className="font-semibold" style={{ color: "#2C2E33" }}>
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}
              </span>{" "}
              of <span className="font-semibold" style={{ color: "#2C2E33" }}>{TOTAL}</span> entries
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: "#2C2E33" }}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {PAGES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPage(Number(p))}
                  className="w-8 h-8 text-sm rounded-lg font-medium transition-colors cursor-pointer"
                  style={
                    page === p
                      ? { backgroundColor: "#F1913D", color: "#FFFFFF" }
                      : { color: "#2C2E33", backgroundColor: "transparent" }
                  }
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(LAST_PG, p + 1))}
                disabled={page === LAST_PG || LAST_PG === 0}
                className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: "#2C2E33" }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
      </motion.div>

      {/* ── Edit Modal ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-[100vw] mt-5 h-full p-0 border-none bg-black/20 backdrop-blur-sm [&>button]:hidden shadow-none">
          <CreateAdvertisementForm initialData={selectedAd || undefined} onCancel={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the advertisement
              <span className="font-bold text-gray-900 mx-1">&quot;{selectedAd?.title}&quot;</span>
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
