"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAssignAdminMutation,
  useGetAllAdminQuery,
  useUpdateAssignUserMutation,
} from "@/features/assignAdmin/assignAdminApi";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { CustomLoading } from "../../hooks/CustomLoading";

/* ── Permission definitions ────────────────────────────────── */
const DASHBOARD_ROUTES = [
  { key: "overview", label: "Overview" },
  { key: "propertyListing", label: "Property Management – Listing" },
  { key: "propertyHotel", label: "Property Management – Hotels" },
  { key: "reservation", label: "Reservation Management" },
  { key: "customer", label: "Customer Management" },
  { key: "partner", label: "Partner Management" },
  { key: "transportation", label: "Transportation Management" },
  { key: "poa", label: "POA Management" },
  { key: "revenue", label: "Revenue Management" },
  { key: "inquiries", label: "Inquiries Management" },
  { key: "review", label: "Review Management" },
  { key: "blog", label: "Blog Management" },
  { key: "newsletter", label: "Newsletter Management" },
  { key: "advertisement", label: "Advertisement Management" },
  { key: "profile", label: "Profile" },
  { key: "privacyPolicy", label: "Privacy Policy" },
  { key: "termsAndCondition", label: "Terms & Condition" },
  { key: "assignAdmin", label: "Assign Admin" },
  { key: "settings", label: "Settings" },
];

/* ── Types ──────────────────────────────────────────────────── */
interface Admin {
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
  roleRef?: {
    _id: string;
    permissions: string[];
  };
}

/* ── Status badge ───────────────────────────────────────────── */
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

/* ── Permission checkboxes panel ────────────────────────────── */
function PermissionPanel({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const allSelected = selected.length === DASHBOARD_ROUTES.length;

  const toggle = (key: string) =>
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    );

  const toggleAll = () =>
    onChange(allSelected ? [] : DASHBOARD_ROUTES.map((r) => r.key));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
          Dashboard Permissions
        </Label>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium underline"
          style={{ color: "#F1913D" }}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 border rounded-lg p-3"
        style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA" }}>
        {DASHBOARD_ROUTES.map((route) => (
          <label
            key={route.key}
            className="flex items-center gap-2 cursor-pointer select-none py-1"
          >
            <Checkbox
              checked={selected.includes(route.key)}
              onCheckedChange={() => toggle(route.key)}
              className="data-[state=checked]:bg-[#F1913D] data-[state=checked]:border-[#F1913D]"
            />
            <span className="text-sm" style={{ color: "#2C2E33" }}>
              {route.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function AssignAdmin() {
  const [page, setPage] = useState(1);

  /* Create modal state */
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [createPerms, setCreatePerms] = useState<string[]>([]);

  /* Edit modal state */
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "" });
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const { data, isLoading, isError } = useGetAllAdminQuery({ page, limit: 10 });
  const [assignAdmin, { isLoading: isCreating }] = useAssignAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAssignUserMutation();

  if (isLoading) return <CustomLoading />;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">Failed to load admins</div>
    );

  const admins: Admin[] = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    limit: 10,
    page: 1,
    totalPage: 1,
  };
  const { total: TOTAL, limit: PER_PAGE, totalPage: LAST_PG } = pagination;
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);

  /* ── Handlers ── */
  const openCreate = () => {
    setCreateForm({ firstName: "", lastName: "", email: "", password: "" });
    setCreatePerms([]);
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignAdmin({ ...createForm, permissions: createPerms }).unwrap();
      toast.success("Admin assigned successfully!");
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to assign admin");
    }
  };

  const openEdit = (admin: Admin) => {
    setEditAdmin(admin);
    setEditForm({ firstName: admin.firstName, lastName: admin.lastName, email: admin.email });
    setEditPerms(admin.roleRef?.permissions ?? []);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;
    try {
      await updateAdmin({
        userId: editAdmin._id,
        formData: { ...editForm, permissions: editPerms },
      }).unwrap();
      toast.success("Admin updated successfully!");
      setIsEditOpen(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to update admin");
    }
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2C2E33" }}>
            Assign Admin
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6C757D" }}>
            Manage admin users and their dashboard permissions
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 text-white font-semibold"
          style={{ backgroundColor: "#F1913D" }}
        >
          <UserPlus className="w-4 h-4" />
          Assign Admin
        </Button>
      </div>

      {/* ── Table Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-none shadow-sm bg-white overflow-hidden p-0">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
              Admin List
            </h2>
            <span className="text-sm" style={{ color: "#6C757D" }}>
              Total: <strong style={{ color: "#2C2E33" }}>{TOTAL}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#F2F2F2" }}>
                  <TableHead className="text-xs font-semibold pl-6" style={{ color: "#6C757D" }}>
                    Admin Info
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    User ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Permissions
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                    Joined
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-center" style={{ color: "#6C757D" }}>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {admins.map((admin) => (
                  <TableRow
                    key={admin._id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-xs" style={{ color: "#6C757D" }}>
                          {admin.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                        {admin.uid || "N/A"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={admin.status} />
                    </TableCell>

                    <TableCell>
                      {(admin.roleRef?.permissions?.length ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
                          <ShieldCheck className="w-3 h-3" />
                          {admin.roleRef!.permissions.length} routes
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "#6C757D" }}>
                          No permissions
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>
                        {admin.createdAt
                          ? format(new Date(admin.createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        onClick={() => openEdit(admin)}
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Permissions"
                      >
                        <Pencil className="w-4 h-4" style={{ color: "#F1913D" }} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}

                {admins.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-sm"
                      style={{ color: "#6C757D" }}
                    >
                      No admins found.
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
              <span className="font-semibold" style={{ color: "#2C2E33" }}>
                {TOTAL}
              </span>{" "}
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

              {PAGES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
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

      {/* ── Create Modal ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Assign Admin</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                  First Name
                </Label>
                <Input
                  required
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="Fahim"
                  className="h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                  style={{ borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                  Last Name
                </Label>
                <Input
                  required
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Hasan"
                  className="h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                  style={{ borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                Email Address
              </Label>
              <Input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@example.com"
                className="h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                style={{ borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                Password
              </Label>
              <Input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                style={{ borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" }}
              />
            </div>

            <PermissionPanel selected={createPerms} onChange={setCreatePerms} />

            <DialogFooter className="pt-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1 h-11 rounded-xl font-semibold border"
                style={{ borderColor: "#F2F2F2", color: "#2C2E33" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="flex-1 h-11 rounded-xl font-semibold text-white gap-2"
                style={{ backgroundColor: "#F1913D" }}
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCreating ? "Assigning..." : "Assign Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Admin</DialogTitle>
          </DialogHeader>

          {editAdmin && (
            <form onSubmit={handleUpdate} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                    First Name
                  </Label>
                  <Input
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                    style={{ borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                    Last Name
                  </Label>
                  <Input
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                    style={{ borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                  Email Address
                </Label>
                <Input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                  style={{ borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" }}
                />
              </div>

              <PermissionPanel selected={editPerms} onChange={setEditPerms} />

              <DialogFooter className="pt-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 h-11 rounded-xl font-semibold border"
                  style={{ borderColor: "#F2F2F2", color: "#2C2E33" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 h-11 rounded-xl font-semibold text-white gap-2"
                  style={{ backgroundColor: "#F1913D" }}
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
