"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCustomarQuery } from "@/features/customar/customarApi";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CustomLoading } from "../../hooks/CustomLoading";
import { useMarkPageSeen } from "../../hooks/useMarkPageSeen";
import { useNewItemsTracker } from "../../hooks/useNewItemsTracker";
import { baseURL } from '../../utils/BaseURL';
import NewPulseDot from "../notifications/NewPulseDot";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

/* ── Types ─────────────────────────────────────────────────── */
interface User {
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
    inactive: { bg: "#F3F4F6", color: "#6C757D" },
    pending: { bg: "#FEF0E4", color: "#F1913D" },
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
export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: customerData, isLoading, isError } = useGetCustomarQuery({ page, limit: 10 }, { pollingInterval: 3000 });
  useMarkPageSeen("customer", customerData?.pagination?.total);
  const { isNew, dismiss } = useNewItemsTracker(
    "customer",
    (customerData?.data || []).map((u: User) => u._id)
  );

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load customers</div>;

  const customers: User[] = customerData?.data || [];
  const pagination = customerData?.pagination || { total: 0, limit: 10, page: 1, totalPage: 1 };

  /* filter rows (defaulting to all since tabs are currently hidden) */
  const filtered = customers;

  const TOTAL = pagination.total;
  const PER_PAGE = pagination.limit;
  const LAST_PG = pagination.totalPage;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  const dynamicStats = [
    { label: "Total users", value: TOTAL.toLocaleString(), icon: CalendarCheck, iconBg: "#E8F5E9", iconColor: "#2B9724" },
    { label: "Active Now", value: customers.filter((c: User) => c.status === 'active').length.toString(), icon: CalendarCheck, iconBg: "#E8F5E9", iconColor: "#2B9724" },
  ];

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    dismiss(user._id);
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
              <Card className="px-5 py-3 border-none shadow-sm bg-white flex flex-col gap-3 ">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: s.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.iconColor }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "#6C757D" }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: "#2C2E33" }}>{s.value}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Customer List Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-sm bg-white overflow-hidden p-0">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>Customer List</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#F2F2F2" }}>
                  <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>
                    Customer Info
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
                {filtered.map((c: User) => (
                  <TableRow
                    key={c._id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Customer Info */}
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        {isNew(c._id) && <NewPulseDot />}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100">
                          {c.image ? (
                            <Image
                              src={c.image.startsWith('http') ? c.image : baseURL + c.image}
                              alt={c.firstName}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{c.firstName} {c.lastName}</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>{c.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell><StatusBadge status={c.status} /></TableCell>

                    {/* Join Date */}
                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>
                        {c.createdAt ? format(new Date(c.createdAt), "MMM dd, yyyy") : "N/A"}
                      </span>
                    </TableCell>

                    {/* User ID */}
                    <TableCell>
                      <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                        {c.uid || "N/A"}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleViewDetails(c)}
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
                      No customers found.
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
                className="flex items-center gap-1 px-3 h-8 text-sm rounded-sm disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: "#2C2E33" }}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {PAGES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPage(Number(p))}
                  className="w-8 h-8 text-sm rounded-sm font-medium transition-colors cursor-pointer"
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
                disabled={page === LAST_PG}
                className="flex items-center gap-1 px-3 h-8 text-sm rounded-sm disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
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
            <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm bg-gray-200">
                  {selectedUser.image ? (
                    <Image
                      src={selectedUser.image.startsWith('http') ? selectedUser.image : baseURL + selectedUser.image}
                      alt={selectedUser.firstName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl text-gray-400 font-bold">
                      {selectedUser.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedUser.status} />
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
                        <span className="text-sm text-gray-500">User ID</span>
                        <span className="text-sm font-medium">{selectedUser.uid || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Role</span>
                        <span className="text-sm font-medium capitalize">{selectedUser.role}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Join Date</span>
                        <span className="text-sm font-medium">
                          {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), "PPP") : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium">{selectedUser.phone || "N/A"}</span>
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
                        <span className={`text-sm font-medium ${selectedUser.isVerified ? 'text-green-600' : 'text-red-500'}`}>
                          {selectedUser.isVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-sm text-gray-500">Doc Status</span>
                        <span className="text-sm font-medium capitalize">
                          {selectedUser.verification?.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedUser.address && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Address</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {[
                          selectedUser.address.street,
                          selectedUser.address.city,
                          selectedUser.address.state,
                          selectedUser.address.country
                        ].filter(Boolean).join(', ') || "No address provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Documents */}
              {selectedUser.verification && selectedUser.verification.documents && selectedUser.verification.documents.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Verification Documents</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.verification.documents.map((doc: string, idx: number) => (
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
