"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

import { motion } from "framer-motion";
import { CalendarIcon, CheckCircleIcon, ClockIcon, HomeIcon, UserIcon } from 'lucide-react';
import { HiExclamationCircle } from 'react-icons/hi';

type Booking = { propertyName?: string; time?: string; date?: string };
type EventItem = { title?: string; time?: string; date?: string };

type ActivityItem = {
  title: string;
  time?: string;
  type?: 'property' | 'reservation' | 'event' | 'user' | 'system';
};

type OverviewData = {
  recentActivities?: ActivityItem[];
  recentBookings?: Booking[];
  recentEvents?: EventItem[];
  totalProperties?: number;
  activeReservations?: number;
  totalReservations?: number;
  totalUsers?: number;
};

type Props = {
  overviewData?: OverviewData;
};

const fallbackItems: ActivityItem[] = [
  { title: "No recent activity available", time: "—", type: 'system' },
];

// Helper function to get icon based on activity type
const getActivityIcon = (type?: ActivityItem['type']): ReactNode => {
  switch (type) {
    case 'property':
      return <HomeIcon className="w-4 h-4 text-blue-600" />;
    case 'reservation':
      return <CalendarIcon className="w-4 h-4 text-green-600" />;
    case 'event':
      return <ClockIcon className="w-4 h-4 text-purple-600" />;
    case 'user':
      return <UserIcon className="w-4 h-4 text-orange-600" />;
    case 'system':
      return <HiExclamationCircle className="w-4 h-4 text-gray-600" />;
    default:
      return <CheckCircleIcon className="w-4 h-4 text-teal-600" />;
  }
};

// Helper function to get background color based on activity type
const getIconBgColor = (type?: ActivityItem['type']): string => {
  switch (type) {
    case 'property':
      return 'bg-blue-50';
    case 'reservation':
      return 'bg-green-50';
    case 'event':
      return 'bg-purple-50';
    case 'user':
      return 'bg-orange-50';
    case 'system':
      return 'bg-gray-50';
    default:
      return 'bg-teal-50';
  }
};

export default function LiveActivity({ overviewData }: Props) {
  // Format the items with proper types
  const items: ActivityItem[] = (() => {
    const recentActivities = overviewData?.recentActivities;
    if (Array.isArray(recentActivities) && recentActivities.length > 0) {
      return recentActivities;
    }

    const recentBookings = overviewData?.recentBookings;
    if (Array.isArray(recentBookings) && recentBookings.length > 0) {
      return recentBookings.map((booking: Booking) => ({
        title: `New booking: ${booking.propertyName || 'Property'}`,
        time: booking.time || booking.date || '',
        type: 'reservation'
      }));
    }

    const recentEvents = overviewData?.recentEvents;
    if (Array.isArray(recentEvents) && recentEvents.length > 0) {
      return recentEvents.map((event: EventItem) => ({
        title: event.title || 'Event',
        time: event.time || event.date || '',
        type: 'event'
      }));
    }

    if (overviewData) {
      const summaryItems: ActivityItem[] = [];

      if (overviewData.totalProperties) {
        summaryItems.push({
          title: `Total properties: ${overviewData.totalProperties}`,
          time: 'Current',
          type: 'property'
        });
      }

      if (overviewData.activeReservations || overviewData.totalReservations) {
        summaryItems.push({
          title: `Active reservations: ${overviewData.activeReservations || overviewData.totalReservations}`,
          time: 'Current',
          type: 'reservation'
        });
      }

      if (overviewData.totalUsers) {
        summaryItems.push({
          title: `Total users: ${overviewData.totalUsers}`,
          time: 'Current',
          type: 'user'
        });
      }

      return summaryItems.length > 0 ? summaryItems : fallbackItems;
    }

    return fallbackItems;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="h-full"
    >
      <Card className="border-none shadow-sm bg-white h-full flex flex-col">
        <CardContent className="p-6 flex flex-col gap-4 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>
              Property Activity
            </h2>
          </div>

          <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
            {items.map((item, index) => (
              <motion.div
                key={`activity-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.06 }}
                className="flex items-start gap-3 group hover:bg-gray-50 rounded-lg p-2 transition-colors -mx-2"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${getIconBgColor(item.type)}`}
                >
                  {getActivityIcon(item.type)}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-gray-800 group-hover:text-gray-900 transition-colors">
                    {item.title}
                  </p>
                  {item.time && item.time !== '—' && (
                    <p className="text-xs font-medium" style={{ color: "#F1913D" }}>
                      {item.time}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}