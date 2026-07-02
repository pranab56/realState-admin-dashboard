"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";

// Map every protected route path to its permission key
const ROUTE_PERMISSION_MAP: Record<string, string> = {
  "/": "overview",
  "/property-management/listing": "propertyListing",
  "/property-management/hotel": "propertyHotel",
  "/reservation-management": "reservation",
  "/user-management": "customer",
  "/partner-management": "partner",
  "/transportation": "transportation",
  "/poa": "poa",
  "/revenue-management": "revenue",
  "/inquiries": "inquiries",
  "/review": "review",
  "/blog-management": "blog",
  "/newsletter-management": "newsletter",
  "/advertisement-management": "advertisement",
  "/profile": "profile",
  "/disclaimer/privacy-policy": "privacyPolicy",
  "/disclaimer/terms-and-condition": "termsAndCondition",
  "/assign-admin": "assignAdmin",
  "/settings": "settings",
};

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const role = useSelector((s: { auth: { role: string | null } }) => s.auth.role);
  const permissions = useSelector((s: { auth: { permissions: string[] } }) => s.auth.permissions);

  useEffect(() => {
    const token = localStorage.getItem("zila-admin-token");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // super_admin has access to everything
    if (role === "super_admin") return;

    // While role is still loading from the server, do nothing
    if (!role) return;

    // admin: check if current route is permitted
    if (role === "admin" && permissions.length > 0) {
      const requiredKey = ROUTE_PERMISSION_MAP[pathname];
      if (requiredKey && !permissions.includes(requiredKey)) {
        // Redirect to the first permitted route, or "/" as fallback
        const firstPermitted = Object.entries(ROUTE_PERMISSION_MAP).find(
          ([, key]) => permissions.includes(key)
        );
        router.replace(firstPermitted ? firstPermitted[0] : "/auth/login");
      }
    }
  }, [router, pathname, role, permissions]);

  return <>{children}</>;
}
