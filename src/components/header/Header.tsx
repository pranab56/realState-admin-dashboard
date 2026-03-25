"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/": { title: "Overview", sub: "Welcome back, see what's happening today." },
  "/property-management/listing": { title: "Property List", sub: "Manage all property listings and details." },
  "/property-management/add": { title: "Add Property", sub: "Create a new property listing for the platform." },
  "/user-management": { title: "Customer List", sub: "Manage your users, roles, and permissions." },
  "/partner-management": { title: "Partners List", sub: "Manage all your partners and integrations." },
  "/revenue-management": { title: "Recent Transactions", sub: "Manage your platform revenue and financial transactions." },
  "/content-management": { title: "Content Lists", sub: "Manage your pages, blog posts, and legal content." },
  "/platform-settings": { title: "Platform Settings", sub: "Configure your platform fees, localization, and security." },
  "/profile": { title: "Account Settings", sub: "Manage your personal details, preferences, and account security." },
};

const USER_AVATAR = "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=48&h=48&fit=crop&auto=format";

export default function MyNavber() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] || { title: "Admin Panel", sub: "Welcome to your admin dashboard." };

  return (
    <header className="flex h-20 items-center justify-between gap-4 bg-white px-6 w-full shrink-0 border-b" style={{ borderColor: "#F2F2F2" }}>

      <div className="flex items-center gap-4 overflow-hidden">
        {/* Sidebar Trigger with orange background and icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FEF0E4" }}>
          <SidebarTrigger className="h-11 w-11 hover:bg-transparent shadow-none border-0 text-[#F1913D]" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl font-bold leading-tight" style={{ color: "#2C2E33" }}>
            {meta.title}
          </h1>
          <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
            {meta.sub}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none mb-1 group-hover:text-[#F1913D] transition-colors" style={{ color: "#2C2E33" }}>
              Rasel Parvez
            </p>
            <p className="text-xs font-semibold" style={{ color: "#6C757D" }}>
              Admin
            </p>
          </div>
          <Avatar className="h-11 w-11 rounded-xl border-0 transition-all">
            <AvatarImage src={USER_AVATAR} alt="Rasel Parvez" className="object-cover" />
            <AvatarFallback className="rounded-xl bg-[#F1913D] text-white">RP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
