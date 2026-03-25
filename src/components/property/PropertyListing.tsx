"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState } from "react";

/* ── Stat cards ─────────────────────────────────────────────── */
const stats = [
  { label: "Pending Verification", value: "42", dark: true },
  { label: "Active Listings", value: "912", dark: false },
  { label: "Total Sales (ETB)", value: "4.2M", dark: false },
];

/* ── Dummy property rows ─────────────────────────────────────── */
type Status = "Active" | "Pending" | "Sold";

const properties: {
  id: number;
  name: string;
  sub: string;
  img: string;
  owner: string;
  role: string;
  status: Status;
  featured: string;
  verified: boolean;
}[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  name: "The Ritz-Carlton",
  sub: "Superior Room",
  img: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=80&h=60&fit=crop&auto=format`,
  owner: "Jonathan Wick",
  role: "Pro Agent",
  status: (["Active", "Pending", "Sold", "Active", "Active", "Active", "Pending", "Active", "Sold"] as Status[])[i],
  featured: "For Rent",
  verified: true,
}));

const TOTAL = 240;
const PER_PAGE = 9;
const LAST_PAGE = Math.ceil(TOTAL / PER_PAGE);

/* ── Status badge ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
        Active
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
        style={{ borderColor: "#F1913D", color: "#F1913D", backgroundColor: "#FEF0E4" }}>
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ borderColor: "#D1D5DB", color: "#6C757D", backgroundColor: "#F9FAFB" }}>
      Sold
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function PropertyListing() {
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const toggleAll = () =>
    setSelected(selected.length === properties.length ? [] : properties.map((p) => p.id));

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /* pagination pages shown */
  const pages = [1, 2, 3, "...", LAST_PAGE];

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className="p-5 border-none shadow-sm flex flex-col gap-3"
              style={{ backgroundColor: s.dark ? "#2C2E33" : "#FFFFFF" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: s.dark ? "rgba(255,255,255,0.08)" : "#E8F5E9" }}
              >
                <CalendarCheck className="w-5 h-5" style={{ color: "#2B9724" }} />
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: s.dark ? "rgba(255,255,255,0.65)" : "#6C757D" }}
              >
                {s.label}
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: s.dark ? "#FFFFFF" : "#2C2E33" }}
              >
                {s.value}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card className="p-4 border-none shadow-sm bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Type", placeholder: "All Types", items: ["All Types", "Apartment", "Villa", "Office"] },
            { label: "Status", placeholder: "All Statuses", items: ["All Statuses", "Active", "Pending", "Sold"] },
            { label: "Verification", placeholder: "Any", items: ["Any", "Verified", "Unverified"] },
            { label: "Featured", placeholder: "Any", items: ["Any", "For Rent", "For Sale", "Featured"] },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#6C757D" }}>{f.label}</label>
              <Select defaultValue={f.placeholder}>
                <SelectTrigger
                  className="h-10 w-full py-5 text-sm rounded-lg border"
                  style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='w-full'>
                  {f.items.map((item) => (
                    <SelectItem className='w-full' key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Table Card ── */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        {/* Table header row */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            All Property List
          </h2>
          <Button
            onClick={() => router.push("/property-management/add")}
            className="h-9 px-4 text-sm font-semibold rounded-lg gap-2 cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F1913D", color: "#FFFFFF" }}
          >
            <Plus className="w-4 h-4" />
            Add New Listing
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#F2F2F2" }}>
                <TableHead className="w-10 pl-6">
                  <Checkbox
                    checked={selected.length === properties.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Property Details
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Owner
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Featured
                </TableHead>
                <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>
                  Verification
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((prop) => (
                <TableRow
                  key={prop.id}
                  style={{ borderColor: "#F2F2F2" }}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  {/* Checkbox */}
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selected.includes(prop.id)}
                      onCheckedChange={() => toggle(prop.id)}
                    />
                  </TableCell>

                  {/* Property Details */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={prop.img}
                          alt={prop.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                          {prop.name}
                        </p>
                        <p className="text-xs" style={{ color: "#6C757D" }}>{prop.sub}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
                      {prop.owner}
                    </p>
                    <p className="text-xs" style={{ color: "#6C757D" }}>{prop.role}</p>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={prop.status} />
                  </TableCell>

                  {/* Featured */}
                  <TableCell>
                    <span className="text-sm font-medium" style={{ color: "#2C2E33" }}>
                      {prop.featured}
                    </span>
                  </TableCell>

                  {/* Verification */}
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: "#2B9724" }}>
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#F2F2F2" }}>
          {/* Info */}
          <p className="text-sm" style={{ color: "#6C757D" }}>
            Showing <span className="font-semibold" style={{ color: "#2C2E33" }}>
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}
            </span> of{" "}
            <span className="font-semibold" style={{ color: "#2C2E33" }}>{TOTAL}</span> entries
          </p>

          {/* Pages */}
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {pages.map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-1 text-sm" style={{ color: "#6C757D" }}>...</span>
              ) : (
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
              )
            )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(LAST_PAGE, p + 1))}
              disabled={page === LAST_PAGE}
              className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-gray-100"
              style={{ color: "#2C2E33" }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
