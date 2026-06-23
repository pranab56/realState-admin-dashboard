"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearUnseenCount } from "@/features/notifications/newDataSlice";

const storageKey = (key: string) => `lastSeenTotal:${key}`;

/**
 * Call from a management page with its current list total.
 * Marks that entity as "seen" so the global new-data badge clears
 * while the admin is actively looking at the list.
 */
export function useMarkPageSeen(key: string, total: number | undefined) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (total === undefined || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey(key), String(total));
    dispatch(clearUnseenCount(key));
  }, [key, total, dispatch]);
}
