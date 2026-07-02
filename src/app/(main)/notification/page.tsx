"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomLoading } from "@/hooks/CustomLoading";
import { cn } from "@/lib/utils";
import {
  useGetAllNotificationQuery,
  useReadAllNotificationMutation,
  useReadNotificationMutation,
} from "@/features/notification/notificationApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarCheck,
  Car,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gavel,
  Hotel,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

/* ── Types ─────────────────────────────────────────────────── */
interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  receiver: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
}

/* ── Type → icon / color mapping ─────────────────────────────── */
const TYPE_META: Record<string, { icon: typeof Bell; bg: string; color: string }> = {
  reservation: { icon: CalendarCheck, bg: "#FEF0E4", color: "#F1913D" },
  review: { icon: Star, bg: "#FEF9E7", color: "#EAB308" },
  customer: { icon: Users, bg: "#E8F5E9", color: "#2B9724" },
  partner: { icon: Users, bg: "#E8F5E9", color: "#2B9724" },
  kyc: { icon: ShieldCheck, bg: "#E0F2F1", color: "#0EA5A4" },
  verification: { icon: ShieldCheck, bg: "#E0F2F1", color: "#0EA5A4" },
  revenue: { icon: CreditCard, bg: "#E8EEFF", color: "#3B5BDB" },
  payment: { icon: CreditCard, bg: "#E8EEFF", color: "#3B5BDB" },
  inquiries: { icon: MessageSquare, bg: "#F3E8FF", color: "#9333EA" },
  newsletter: { icon: Mail, bg: "#FEE2E2", color: "#DC3545" },
  blog: { icon: Newspaper, bg: "#F3F4F6", color: "#6C757D" },
  transportation: { icon: Car, bg: "#FEF0E4", color: "#F1913D" },
  poa: { icon: Gavel, bg: "#F3F4F6", color: "#6C757D" },
  propertyListing: { icon: Hotel, bg: "#E8F5E9", color: "#2B9724" },
  propertyHotel: { icon: Hotel, bg: "#E8F5E9", color: "#2B9724" },
  advertisement: { icon: Megaphone, bg: "#FEF0E4", color: "#F1913D" },
};

const getTypeMeta = (type: string) =>
  TYPE_META[type] || { icon: Bell, bg: "#F3F4F6", color: "#6C757D" };

export default function NotificationPage() {
  const [page, setPage] = useState(1);
  const role = useSelector((s: { auth: { role: string | null } }) => s.auth.role);
  const permissions = useSelector((s: { auth: { permissions: string[] } }) => s.auth.permissions);

  const { data, isLoading, isError } = useGetAllNotificationQuery(
    { page },
    { pollingInterval: 5000 }
  );
  const [readNotification] = useReadNotificationMutation();
  const [readAllNotification, { isLoading: isMarkingAll }] = useReadAllNotificationMutation();

  if (isLoading) return <CustomLoading />;
  if (isError)
    return <div className="p-10 text-center text-red-500">Failed to load notifications</div>;

  const allNotifications: Notification[] = data?.data?.data || [];

  // Filter notifications by the admin's permitted types
  const notifications = role === "super_admin"
    ? allNotifications
    : allNotifications.filter((n) => permissions.includes(n.type));

  const unreadCount: number = notifications.filter((n) => !n.isRead).length;
  const TOTAL = notifications.length;
  const PER_PAGE = 10;
  const LAST_PG = Math.max(1, Math.ceil(TOTAL / PER_PAGE));
  const PAGES = Array.from({ length: LAST_PG }, (_, i) => i + 1);
  const pagedNotifications = notifications.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleOpenNotification = async (n: Notification) => {
    if (n.isRead) return;
    try {
      await readNotification({ notificationId: n._id }).unwrap();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await readAllNotification({}).unwrap();
      toast.success("All notifications marked as read");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to mark all as read");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "#2C2E33" }}>
            Notifications
          </h1>
          <p className="text-sm" style={{ color: "#6C757D" }}>
            Stay updated with the latest activity across your platform.
          </p>
        </div>
        <Button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || isMarkingAll}
          className="rounded-full px-6 disabled:opacity-50"
          style={{ backgroundColor: "#F1913D", color: "#FFFFFF" }}
        >
          {isMarkingAll ? "Marking..." : "Mark all as read"}
        </Button>
      </motion.div>

      {/* ── Notifications Card ── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-none shadow-sm bg-white overflow-hidden p-0">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "#2C2E33" }}>
              <Bell className="w-5 h-5" style={{ color: "#F1913D" }} />
              Recent Activity
            </h2>
            <Badge
              className="rounded-full font-semibold border-none"
              style={{ backgroundColor: "#FEF0E4", color: "#F1913D" }}
            >
              {unreadCount} Unread
            </Badge>
          </div>

          {/* List */}
          <div>
            <AnimatePresence initial={false}>
              {pagedNotifications.length > 0 ? (
                pagedNotifications.map((n) => {
                  const { icon: Icon, bg, color } = getTypeMeta(n.type);
                  return (
                    <motion.div
                      key={n._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleOpenNotification(n)}
                      className={cn(
                        "flex items-start gap-4 px-6 py-4 border-t cursor-pointer transition-colors hover:bg-gray-50/60",
                        !n.isRead && "bg-[#FEF8F2]"
                      )}
                      style={{ borderColor: "#F2F2F2" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: bg }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn("text-sm leading-tight", !n.isRead ? "font-semibold" : "font-medium")}
                            style={{ color: "#2C2E33" }}
                          >
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#F1913D" }} />
                          )}
                        </div>
                        <p className="text-sm mt-0.5 line-clamp-2" style={{ color: "#6C757D" }}>
                          {n.message}
                        </p>
                      </div>

                      <span className="text-xs whitespace-nowrap shrink-0 mt-0.5" style={{ color: "#6C757D" }}>
                        {n.timeAgo}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="p-4 rounded-full mb-3" style={{ backgroundColor: "#F3F4F6" }}>
                    <Bell className="w-10 h-10" style={{ color: "#9CA3AF" }} />
                  </div>
                  <p className="text-base font-medium" style={{ color: "#6C757D" }}>
                    No notifications yet
                  </p>
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>
                    You&apos;re all caught up!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pagedNotifications.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-4 border-t"
              style={{ borderColor: "#F2F2F2" }}
            >
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
                  disabled={page === LAST_PG || LAST_PG === 0}
                  className="flex items-center gap-1 px-3 h-8 text-sm rounded-sm disabled:opacity-40 cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ color: "#2C2E33" }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
