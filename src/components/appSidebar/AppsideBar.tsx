"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/features/auth/authSlice";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Car,
  CircleDollarSign,
  FileText,
  Handshake,
  Inbox,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  Scale,
  ScrollText,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NewPulseDot from "../notifications/NewPulseDot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type MenuChild = { name: string; path: string; key?: string };
type MenuItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  key?: string;
  children?: MenuChild[];
};

const menuItems: MenuItem[] = [
  { name: "Overview", path: "/", icon: LayoutDashboard, key: "overview" },
  {
    name: "Property Management",
    path: "/property-management",
    icon: Building2,
    children: [
      { name: "Manage Listing", path: "/property-management/listing", key: "propertyListing" },
      { name: "Manage Hotels", path: "/property-management/hotel", key: "propertyHotel" },
    ],
  },
  { name: "Reservation Management", path: "/reservation-management", icon: Calendar, key: "reservation" },
  { name: "Customers Management", path: "/user-management", icon: Users, key: "customer" },
  { name: "Partner Management", path: "/partner-management", icon: Handshake, key: "partner" },
  { name: "Transportation Management", path: "/transportation", icon: Car, key: "transportation" },
  { name: "POA Management", path: "/poa", icon: Scale, key: "poa" },
  { name: "Revenue Management", path: "/revenue-management", icon: CircleDollarSign, key: "revenue" },
  { name: "Inquiries Management", path: "/inquiries", icon: Inbox, key: "inquiries" },
  { name: "Review Management", path: "/review", icon: Star, key: "review" },
  { name: "Blog Management", path: "/blog-management", icon: FileText, key: "blog" },
  { name: "Newsletter Management", path: "/newsletter-management", icon: FileText, key: "newsletter" },
  { name: "Advertisement Management", path: "/advertisement-management", icon: FileText, key: "advertisement" },
  { name: "Profile", path: "/profile", icon: User, key: "profile" },
  {
    name: "Disclaimer",
    path: "/disclaimer",
    icon: ScrollText,
    children: [
      { name: "Privacy Policy", path: "/disclaimer/privacy-policy", key: "privacyPolicy" },
      { name: "Terms & Condition", path: "/disclaimer/terms-and-condition", key: "termsAndCondition" },
    ],
  },
  { name: "Assign Admin", path: "/assign-admin", icon: Settings, key: "assignAdmin" },
  { name: "Settings", path: "/settings", icon: Settings, key: "settings" },
];

/* ── Skeleton placeholder for the nav area ──────────────────── */
function NavSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1 mt-1", isCollapsed ? "px-2" : "px-3")}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-md bg-white/10 animate-pulse",
            isCollapsed ? "h-10 w-10 mx-auto" : "h-11 w-full"
          )}
          style={{ animationDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  );
}

/* ── Main sidebar ────────────────────────────────────────────── */
export default function AppSideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const role = useSelector((s: { auth: { role: string | null } }) => s.auth.role);
  const permissions = useSelector((s: { auth: { permissions: string[] } }) => s.auth.permissions);
  const permissionsReady = useSelector((s: { auth: { permissionsReady: boolean } }) => s.auth.permissionsReady);
  const unseen = useSelector((s: { newData: { unseen: Record<string, number> } }) => s.newData.unseen);

  // Prevent SSR→client hydration mismatch: don't render real menu items until
  // the component is mounted in the browser (where localStorage is available).
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Determine if a menu item should be visible for the current user.
  // NOTE: only called after isMounted && permissionsReady, so role is never null here.
  const isPermitted = (item: MenuItem): boolean => {
    if (role === "super_admin") return true;
    if (item.children) {
      return item.children.some((c) => c.key && permissions.includes(c.key));
    }
    return item.key ? permissions.includes(item.key) : false;
  };

  const isChildPermitted = (child: MenuChild): boolean => {
    if (role === "super_admin") return true;
    return !child.key || permissions.includes(child.key);
  };

  // Auto-expand sections whose child path is currently active
  const defaultOpen = menuItems
    .filter((item) =>
      item.children?.some(
        (child) => pathname === child.path || pathname.startsWith(child.path + "/")
      )
    )
    .map((item) => item.name);

  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleItem = (name: string) => {
    setOpenItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/auth/login");
  };

  // True when we have enough data to render the correct nav items
  const navReady = isMounted && permissionsReady;

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarContent
        className="flex flex-col h-screen"
        style={{ backgroundColor: "#2C2E33", color: "#FFFFFF" }}
      >
        {/* ── Logo ── */}
        <SidebarHeader
          className={cn(
            "px-6 py-5 transition-all duration-200",
            isCollapsed && "px-3 py-4"
          )}
        >
          <Link href="/" className="flex items-center justify-center">
            <div
              className={cn(
                "relative transition-all duration-300",
                isCollapsed ? "w-16 h-10" : "w-full max-w-[160px] h-14"
              )}
            >
              <Image
                src="/icons/logo.png"
                fill
                alt="ZilaHomes"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </SidebarHeader>

        {/* ── Divider ── */}
        <div className="h-px mx-4 opacity-20" style={{ backgroundColor: "#FFFFFF" }} />

        {/* ── Navigation ── */}
        <SidebarGroup className="flex-1 px-0 mt-2 min-h-0 overflow-hidden">
          <SidebarGroupContent className="h-full overflow-auto">
            {!navReady ? (
              // Show skeleton until role + permissions are confirmed from localStorage
              <NavSkeleton isCollapsed={isCollapsed} />
            ) : (
              <SidebarMenu className="gap-0">
                {menuItems.filter(isPermitted).map((item) => {
                  const active = isActive(item.path);
                  const hasChildren = !!item.children?.length;
                  const isSectionOpen = openItems.includes(item.name);

                  const ownUnseen = item.key ? unseen[item.key] || 0 : 0;
                  const childrenUnseen =
                    item.children?.reduce((sum, c) => sum + (c.key ? unseen[c.key] || 0 : 0), 0) || 0;
                  const hasNew = ownUnseen > 0 || childrenUnseen > 0;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild={!hasChildren}
                        onClick={hasChildren ? () => toggleItem(item.name) : undefined}
                        tooltip={item.name}
                        className={cn(
                          "h-12 px-5 w-full rounded-none transition-colors duration-150 cursor-pointer",
                          "group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center",
                          active
                            ? "text-white font-semibold"
                            : "text-white/80 hover:text-white hover:bg-white/5"
                        )}
                        style={active ? { backgroundColor: "#F1913D" } : {}}
                      >
                        {hasChildren ? (
                          <div
                            className={cn(
                              "flex items-center gap-3 text-sm w-full",
                              isCollapsed && "justify-center gap-0"
                            )}
                          >
                            <span className="relative shrink-0">
                              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                              {hasNew && isCollapsed && (
                                <span className="absolute -top-1 -right-1">
                                  <NewPulseDot />
                                </span>
                              )}
                            </span>
                            {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                            {!isCollapsed && hasNew && <NewPulseDot />}
                          </div>
                        ) : (
                          <Link
                            href={item.path}
                            className={cn(
                              "flex items-center gap-3 text-sm w-full",
                              isCollapsed && "justify-center gap-0"
                            )}
                          >
                            <span className="relative shrink-0">
                              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                              {hasNew && isCollapsed && (
                                <span className="absolute -top-1 -right-1">
                                  <NewPulseDot />
                                </span>
                              )}
                            </span>
                            {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                            {!isCollapsed && hasNew && <NewPulseDot />}
                          </Link>
                        )}
                      </SidebarMenuButton>

                      {/* Sub-items */}
                      <AnimatePresence>
                        {hasChildren && isSectionOpen && !isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <SidebarMenuSub className="border-none ml-8 flex flex-col gap-0 py-1">
                              {item.children?.filter(isChildPermitted).map((child) => {
                                const childActive =
                                  pathname === child.path ||
                                  pathname.startsWith(child.path + "/");
                                const childHasNew = child.key ? (unseen[child.key] || 0) > 0 : false;
                                return (
                                  <SidebarMenuSubItem key={child.name}>
                                    <SidebarMenuSubButton
                                      asChild
                                      className={cn(
                                        "h-10 rounded-none px-4 hover:bg-white/5 transition-colors",
                                        childActive ? "text-white" : "text-white/70 hover:text-white"
                                      )}
                                    >
                                      <Link href={child.path} className="flex items-center gap-3">
                                        <span
                                          className="w-2 h-2 rounded-full shrink-0 border transition-colors"
                                          style={{
                                            backgroundColor: childActive ? "#F1913D" : "transparent",
                                            borderColor: childActive ? "#F1913D" : "rgba(255,255,255,0.4)",
                                          }}
                                        />
                                        <span
                                          className={cn(
                                            "text-sm flex-1 truncate",
                                            childActive ? "font-medium" : "font-light"
                                          )}
                                        >
                                          {child.name}
                                        </span>
                                        {childHasNew && <NewPulseDot />}
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Logout button ── */}
        <SidebarFooter
          className={cn(
            "p-6 pb-8 transition-all duration-200",
            isCollapsed && "p-3 pb-8"
          )}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsLogoutModalOpen(true)}
            title={isCollapsed ? "Logout" : undefined}
            className={cn(
              "w-full h-11 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer overflow-hidden whitespace-nowrap shadow-md",
              isCollapsed && "rounded-full w-11 h-11 p-0 mx-auto"
            )}
            style={{ backgroundColor: "#DC3545" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c82333")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#DC3545")
            }
          >
            <LogOut className="w-4 h-4 rotate-180 shrink-0" />
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </motion.button>
        </SidebarFooter>
      </SidebarContent>

      <AlertDialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and your session will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-[#DC3545] hover:bg-[#c82333] text-white"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
