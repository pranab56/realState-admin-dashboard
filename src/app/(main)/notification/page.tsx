"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, Info, Trash2, XCircle } from "lucide-react";
import { useState } from "react";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Rasel has been confirmed for tomorrow at 10:00 AM.",
    time: "2 hours ago",
    type: "success",
    read: false,
  },
  {
    id: "2",
    title: "New Message",
    message: "You have a new message from the lab department regarding your results.",
    time: "5 hours ago",
    type: "info",
    read: false,
  },
  {
    id: "3",
    title: "Prescription Renewal",
    message: "Your prescription for 'Amoxicillin' is ready for renewal.",
    time: "1 day ago",
    type: "warning",
    read: true,
  },
  {
    id: "4",
    title: "System Update",
    message: "The dashboard will be undergoing maintenance tonight from 2:00 AM to 4:00 AM.",
    time: "2 days ago",
    type: "error",
    read: true,
  },
  {
    id: "5",
    title: "Profile Verified",
    message: "Your professional credentials have been successfully verified.",
    time: "3 days ago",
    type: "success",
    read: true,
  },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "warning":
        return <Bell className="w-5 h-5 text-amber-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-rose-500" />;
    }
  };

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "error":
        return "bg-rose-50 text-rose-700 border-rose-100";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and stay updated with your latest alerts.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
            className="w-full sm:w-auto rounded-xl sm:rounded-full px-6 border-[#6BB9BA] text-[#6BB9BA] hover:bg-[#6BB9BA]/10 shadow-sm transition-all"
          >
            Mark all as read
          </Button>
          <Button
            variant="destructive"
            onClick={clearAll}
            className="w-full sm:w-auto rounded-xl sm:rounded-full px-6 bg-[#FF5858] hover:bg-[#ff4545] shadow-md border-none transition-all"
          >
            Clear All
          </Button>
        </div>
      </motion.div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden p-0">
        <CardHeader className="bg-gradient-to-r from-[#6BB9BA]/10 to-[#9B85C1]/10 border-b border-gray-100">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 pt-5">
            <Bell className="w-5 h-5 text-[#6BB9BA]" />
            Recent Activity
            <Badge variant="secondary" className="ml-2 bg-[#6BB9BA] text-white rounded-full">
              {notifications.length} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="relative overflow-x-auto CustomScrollbar">
            <Table className="min-w-[500px] md:min-w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="w-[60px] sm:w-[80px] text-center">Status</TableHead>
                  <TableHead className="min-w-[200px] py-4">Notification</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Time</TableHead>
                  <TableHead className="w-[80px] sm:w-[100px] text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <motion.tr
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                          transition: { duration: 0.2 }
                        }}
                        transition={{
                          duration: 0.3,
                          opacity: { duration: 0.2 },
                          layout: { duration: 0.3 }
                        }}
                        className={cn(
                          "group transition-colors border-gray-50 cursor-pointer",
                          !notification.read ? "bg-blue-50/30 font-medium" : "bg-transparent"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <TableCell className="text-center py-4">
                          <div className="flex justify-center">
                            {getTypeIcon(notification.type)}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-gray-900 leading-tight">{notification.title}</span>
                            <span className="text-[12px] text-muted-foreground line-clamp-2 sm:line-clamp-1">{notification.message}</span>
                            {/* Mobile only time display */}
                            <span className="sm:hidden text-[10px] text-muted-foreground mt-1">{notification.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4">
                          <Badge className={cn("capitalize font-normal rounded-full px-3 py-0.5 border text-[11px]", getTypeStyles(notification.type))}>
                            {notification.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right text-xs text-muted-foreground py-4">
                          {notification.time}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="w-8 h-8 sm:w-9 sm:h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center text-muted-foreground"
                        >
                          <div className="p-4 rounded-full bg-gray-50 mb-3">
                            <Bell className="w-12 h-12 text-gray-300" />
                          </div>
                          <p className="text-lg font-medium text-gray-400">No notifications found</p>
                          <p className="text-sm">You&apos;re all caught up!</p>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}