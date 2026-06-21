"use client";

import BarChart from "@/components/overview/BarChart";
import CardStates from "@/components/overview/CardStates";
import LineChart from "@/components/overview/LineChart";
import RecentActivity from "@/components/overview/RecentActivity";
import { useGetOverviewQuery } from "@/features/overview/overview";
import { CustomLoading } from '../../hooks/CustomLoading';


export default function Overview() {
  const { data: overviewData, isLoading, isError } = useGetOverviewQuery({});

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load overview data</div>;

  const data = overviewData?.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Row 1 — 4 Stat Cards */}
      <CardStates
        totalRevenue={data?.totalRevenue}
        totalUsers={data?.totalUsers}
        totalProperties={data?.totalProperties}
        totalReservations={data?.totalReservations}
      />

      {/* Row 2 — Revenue Growth chart (full width) */}
      <LineChart revenueGrowth={data?.revenueGrowth} />

      {/* Row 3 — User Distribution + System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart userDistribution={data?.userDistribution} totalUsers={data?.totalUsers} />
        <RecentActivity />
      </div>

    </div>
  );
}
