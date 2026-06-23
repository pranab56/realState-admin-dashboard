"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { setUnseenCount } from "@/features/notifications/newDataSlice";

const storageKey = (key: string) => `lastSeenTotal:${key}`;

function readBaseline(key: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey(key));
  return raw === null ? null : Number(raw);
}

function writeBaseline(key: string, total: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(key), String(total));
}

/**
 * Watches a list endpoint's total count and flags newly arrived items.
 * Meant to be driven by a polling query so it works even when the
 * relevant management page isn't currently open.
 */
export function useNewDataWatcher(key: string, label: string, total: number | undefined) {
  const dispatch = useDispatch();
  const prevTotal = useRef<number | null>(null);

  useEffect(() => {
    if (total === undefined) return;

    let baseline = readBaseline(key);

    if (baseline === null) {
      // first time we've ever seen this entity — establish baseline, no alert
      writeBaseline(key, total);
      prevTotal.current = total;
      return;
    }

    // self-heal if items were deleted and total dropped below baseline
    if (total < baseline) {
      writeBaseline(key, total);
      baseline = total;
      dispatch(setUnseenCount({ key, count: 0 }));
    }

    const unseen = Math.max(0, total - baseline);
    dispatch(setUnseenCount({ key, count: unseen }));

    if (prevTotal.current !== null && total > prevTotal.current) {
      const diff = total - prevTotal.current;
      toast.success(`${diff} new ${label} ${diff === 1 ? "entry" : "entries"} added`);
    }

    prevTotal.current = total;
  }, [key, label, total, dispatch]);
}
