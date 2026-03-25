"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import CreatePageForm from "./CreatePageForm";

/* ── Tab filter ─────────────────────────────────────────────── */
const TABS = ["Blog Posts", "Legal Pages"] as const;
type Tab = (typeof TABS)[number];

/* ── Dummy data ─────────────────────────────────────────────── */
const AVATAR = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&h=48&fit=crop&auto=format";

const content = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  title: "Future of AI in Enterprise",
  slug: "/blog/future-ai-enterprise",
  status: "Published",
  author: "Alex Chen",
  date: "Oct 24, 2023",
}));

const TOTAL = 240;
const PER_PAGE = 9;
const LAST_PG = Math.ceil(TOTAL / PER_PAGE);
const PAGES = [1, 2, 3, "...", LAST_PG];

/* ── Main component ──────────────────────────────────────────── */
export default function ContentManagement() {
  const [tab, setTab] = useState<Tab>("Blog Posts");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const toggleAll = () =>
    setSelected(selected.length === content.length ? [] : content.map((c) => c.id));

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ color: "#2C2E33" }}>Content Lists</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 h-11 px-6 rounded-sm text-base font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#F1913D" }}
            >
              <Plus className="w-5 h-5" /> Create New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[100vw] mt-5 h-full p-0 border-none bg-black/20 backdrop-blur-sm [&>button]:hidden shadow-none">
            <CreatePageForm onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* List Card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-none shadow-sm bg-white overflow-hidden">

          {/* Tabs */}
          <div className="flex gap-8 px-6 pt-4 border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "#F2F2F2" }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); setSelected([]); }}
                className="pb-4 text-base font-semibold relative cursor-pointer whitespace-nowrap transition-colors"
                style={{ color: tab === t ? "#2C2E33" : "#6C757D" }}
              >
                {t}
                {tab === t && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: "#F1913D" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#F2F2F2" }}>
                  <TableHead className="w-10 pl-6">
                    <Checkbox
                      checked={selected.length === content.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Page Title</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Status</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Type</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: "#6C757D" }}>Last Updated</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {content.map((c) => (
                  <TableRow
                    key={c.id}
                    style={{ borderColor: "#F2F2F2" }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onCheckedChange={() => toggle(c.id)}
                      />
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{c.title}</p>
                        <p className="text-xs" style={{ color: "#6C757D" }}>{c.slug}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "#E8F5E9", color: "#2B9724" }}>
                        {c.status}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <Image src={AVATAR} alt={c.author} fill className="object-cover" unoptimized />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#2C2E33" }}>{c.author}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm" style={{ color: "#2C2E33" }}>{c.date}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#F2F2F2" }}>
            <p className="text-sm" style={{ color: "#6C757D" }}>
              Showing <span className="font-semibold" style={{ color: "#2C2E33" }}>{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)}</span> of <span className="font-semibold" style={{ color: "#2C2E33" }}>{TOTAL}</span> entries
            </p>

            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors" style={{ color: "#2C2E33" }}><ChevronLeft className="w-4 h-4" /> Previous</button>
              {PAGES.map((p, i) => (
                p === "..." ? <span key={i} className="px-1 text-sm" style={{ color: "#6C757D" }}>...</span> :
                  <button key={i} onClick={() => setPage(Number(p))} className="w-8 h-8 text-sm rounded-lg font-medium transition-colors cursor-pointer" style={page === p ? { backgroundColor: "#F1913D", color: "#FFFFFF" } : { color: "#2C2E33", backgroundColor: "transparent" }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(LAST_PG, p + 1))} disabled={page === LAST_PG} className="flex items-center gap-1 px-3 h-8 text-sm rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors" style={{ color: "#2C2E33" }}>Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

        </Card>
      </motion.div>
    </div>
  );
}
