import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import OptimusSidebar from "@/components/appSidebar/AppsideBar";
import PermissionInitializer from "@/components/auth/PermissionInitializer";
import Header from "@/components/header/Header";
import GlobalNewDataWatcher from "@/components/notifications/GlobalNewDataWatcher";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Real Estate Admin Dashboard",
  description: "Real Estate Admin Dashboard for Future Pharmacy",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
};
// dsfsdfsdfs
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <GlobalNewDataWatcher />
      <PermissionInitializer />
      <SidebarProvider>
        <OptimusSidebar />
        <SidebarInset className="bg-gray-100 flex flex-col overflow-hidden h-screen">
          <Header />
          <main className="flex-1 p-2 md:p-6 overflow-y-auto min-w-0 flex flex-col">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
