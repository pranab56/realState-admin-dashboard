"use client";

import { setPermissions, setPermissionsReady, setRole } from "@/features/auth/authSlice";
import { useGetMyProfileQuery } from "@/features/profile/profileApi";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function PermissionInitializer() {
  const dispatch = useDispatch();
  const token = useSelector((s: { auth: { token: string | null } }) => s.auth.token);
  const permissionsReady = useSelector((s: { auth: { permissionsReady: boolean } }) => s.auth.permissionsReady);

  // Skip fetch if we already have cached permissions (no need to block the UI)
  const { data } = useGetMyProfileQuery({}, { skip: !token || permissionsReady });

  useEffect(() => {
    if (!data?.data) return;

    const userRole: string = data.data.role;

    if (userRole) dispatch(setRole(userRole));

    if (userRole === "admin") {
      const perms: string[] = data.data.roleRef?.permissions ?? [];
      dispatch(setPermissions(perms));
    } else {
      // super_admin: no permission list needed
      dispatch(setPermissions([]));
    }

    dispatch(setPermissionsReady(true));
  }, [data, dispatch]);

  return null;
}
