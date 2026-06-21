"use client";

import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPartnerQuery } from "@/features/partner/partnerApi";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CustomLoading } from "../../hooks/CustomLoading";
import { baseURL } from "../../utils/BaseURL";

/* ── Types ─────────────────────────────────────────────────── */
interface Partner {
  _id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  status: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  verification?: {
    status: string;
    documents: string[];
  };
}

/* ── Status badge ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: "#E8F5E9", color: "#2B9724" },
    suspended: { bg: "#FEE2E2", color: "#DC3545" },
    inactive: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const { bg, color } = map[s] || map.inactive;
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: bg, color }}>
      {s}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function PartnerManagement() {
  const [page, setPage] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const { data: partnerData, isLoading, isError } = useGetPartnerQuery({ page, limit: 10 });

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load partners</div>;

  const partners: Partner[] = partnerData?.data || [];
  const pagination = partnerData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  /* filtered rows (defaulting to all since tabs are currently hidden) */
  const filtered = partners;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  const dynamicStats = [
    { label: "Total Partners", value: TOTAL.toLocaleString(), icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
    { label: "Active Partners", value: partners.filter((p: Partner) => p.status === 'active').length.toString(), icon: CalendarCheck, bgColor: "#E8F5E9", color: "#2B9724" },
  ];

  const handleViewDetails = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="px-5 py-3 border-none shadow-sm bg-white flex flex-col gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: s.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "#6C757D" }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: "#2C2E33" }}>{s.value}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Partners List Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-sm bg-white overflow-hidden p-0">

          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>Partners List</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#F2F2F2" }}>
                  <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>
                    Partner Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Join Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    User ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((p: Partner) => (
                  <TableRow
                    key={p._id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100">
                          {p.image ? (
                            <Image
                               src={p.image.startsWith('http') ? p.image : baseURL + p.image}
                               alt={p.firstName}
                               fill
                               className="object-cover"
                               unoptimized
                             />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                              {p.firstName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{p.firstName} {p.lastName}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{p.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>
                        {p.createdAt ? format(new Date(p.createdAt), "MMM dd, yyyy") : "N/A"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{p.uid || "N/A"}</span>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        onClick={() => handleViewDetails(p)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-[#F1913D]"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-sm" style={{ color: "#6C757D" }}>
                      No partners found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: "#F2F2F2" }}
          >
            <p className="text-sm" style={{ color: "#6C757D" }}>
              Showing{" "}
              <span className="font-semibold" style={{ color: "#2C2E33" }}>
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}
              </span>{" "}
              of{" "}
              <span className="font-semibold" style={{ color: "#2C2E33" }}>{TOTAL}</span>{" "}
              entries
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

        </Card>
      </motion.div>

      {/* ── Details Modal ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Partner Details</DialogTitle>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm bg-gray-200">
                  {selectedPartner.image ? (
                    <Image
                      src={selectedPartner.image.startsWith('http') ? selectedPartner.image : baseURL + selectedPartner.image}
                      alt={selectedPartner.firstName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl text-gray-400 font-bold">
                      {selectedPartner.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedPartner.firstName} {selectedPartner.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedPartner.email}</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedPartner.status} />
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Account Information</p>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Partner ID</span>
                        <span className="text-sm font-medium">{selectedPartner.uid || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Role</span>
                        <span className="text-sm font-medium capitalize">{selectedPartner.role}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Join Date</span>
                        <span className="text-sm font-medium">
                          {selectedPartner.createdAt ? format(new Date(selectedPartner.createdAt), "PPP") : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium">{selectedPartner.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Verification Status</p>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Verified</span>
                        <span className={`text-sm font-medium ${selectedPartner.isVerified ? 'text-green-600' : 'text-red-500'}`}>
                          {selectedPartner.isVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Doc Status</span>
                        <span className="text-sm font-medium capitalize">
                          {selectedPartner.verification?.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedPartner.address && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Address</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {[
                          selectedPartner.address.street,
                          selectedPartner.address.city,
                          selectedPartner.address.state,
                          selectedPartner.address.country
                        ].filter(Boolean).join(', ') || "No address provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Documents */}
              {selectedPartner.verification && selectedPartner.verification.documents && selectedPartner.verification.documents.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Verification Documents</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPartner.verification.documents.map((doc: string, idx: number) => (
                      <a
                        key={idx}
                        href={doc.startsWith('http') ? doc : baseURL + doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative h-32 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity bg-gray-100"
                      >
                        {doc.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                          <Image
                            src={doc.startsWith('http') ? doc : baseURL + doc}
                            alt={`Document ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <Plus className="w-6 h-6 text-gray-400 rotate-45" />
                            <span className="text-xs text-gray-500">View Document</span>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
