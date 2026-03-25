"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("PharmacyAdmin");


      if (!token || token === null) {
        router.replace("/auth/login");
      }

    }, 2000); // ⏱️ 2 seconds

    return () => clearTimeout(timer);
  }, [router]);



  return <>{children}</>;
}
