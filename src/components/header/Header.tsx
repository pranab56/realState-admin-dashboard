"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NEW_DATA_ENTITIES } from "@/config/newDataEntities";
import { clearUnseenCount } from "@/features/notifications/newDataSlice";
import { useGetMyProfileQuery } from "@/features/profile/profileApi";
import { baseURL } from "@/utils/BaseURL";
import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

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

export default function MyNavber() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const meta = PAGE_META[pathname] || { title: "Admin Panel", sub: "Welcome to your admin dashboard." };

  const { data: profileData, isLoading: isProfileLoading } = useGetMyProfileQuery({});
  const user = profileData?.data;
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";
  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "AD";
  const avatarSrc = user?.image
    ? user.image.startsWith("http") ? user.image : `${baseURL}${user.image}`
    : "";

  const unseen = useSelector((state: { newData: { unseen: Record<string, number> } }) => state.newData.unseen);
  const role = useSelector((s: { auth: { role: string | null } }) => s.auth.role);
  const permissions = useSelector((s: { auth: { permissions: string[] } }) => s.auth.permissions);

  const newEntities = NEW_DATA_ENTITIES.filter((e) => {
    if ((unseen[e.key] || 0) === 0) return false;
    if (role === "super_admin") return true;
    return permissions.includes(e.key);
  });
  const totalUnseen = newEntities.reduce((sum, e) => sum + (unseen[e.key] || 0), 0);

  const handleSelectEntity = (key: string, route: string) => {
    dispatch(clearUnseenCount(key));
    router.push(route);
  };

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:opacity-90"
              style={{ backgroundColor: "#FEF0E4" }}
              title="New data notifications"
            >
              <Bell className="w-5 h-5" style={{ color: "#F1913D" }} />
              {totalUnseen > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: "#DC3545" }}
                >
                  {totalUnseen > 99 ? "99+" : totalUnseen}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>New Data</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {newEntities.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm" style={{ color: "#6C757D" }}>
                You&apos;re all caught up!
              </div>
            ) : (
              newEntities.map((entity) => (
                <DropdownMenuItem
                  key={entity.key}
                  onClick={() => handleSelectEntity(entity.key, entity.route)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="text-sm font-medium" style={{ color: "#2C2E33" }}>{entity.label}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: "#F1913D" }}
                  >
                    {unseen[entity.key]}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {isProfileLoading ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block space-y-1.5">
              <div className="h-3.5 w-24 rounded-md animate-pulse" style={{ backgroundColor: "#F2F2F2" }} />
              <div className="h-2.5 w-14 rounded-md animate-pulse ml-auto" style={{ backgroundColor: "#F2F2F2" }} />
            </div>
            <div className="h-11 w-11 rounded-xl animate-pulse shrink-0" style={{ backgroundColor: "#F2F2F2" }} />
          </div>
        ) : (
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none mb-1 group-hover:text-[#F1913D] transition-colors" style={{ color: "#2C2E33" }}>
                {fullName || "Admin"}
              </p>
              <p className="text-xs font-semibold capitalize" style={{ color: "#6C757D" }}>
                {displayRole || "Admin"}
              </p>
            </div>
            <Avatar className="h-11 w-11 rounded-xl border-0 transition-all">
              <AvatarImage src={avatarSrc} alt={fullName} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-[#F1913D] text-white text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </header>
  )
}
