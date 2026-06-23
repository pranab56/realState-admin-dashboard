"use client";

import { useEffect, useRef, useState } from "react";

const seededFlagKey = (key: string) => `seeded:${key}`;
const viewedKey = (key: string) => `viewedIds:${key}`;

function readViewed(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(viewedKey(key));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeViewed(key: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(viewedKey(key), JSON.stringify(Array.from(ids)));
}

/**
 * Per-row "new" tracking for a management table.
 * An item stays flagged new (pulsing dot) no matter which page the admin
 * is on when it arrives — the only thing that marks it seen is explicitly
 * opening it via the eye/view action. Persisted in localStorage, so it
 * survives refreshes and navigating away to other pages.
 *
 * `currentIds` is only used once, the very first time this entity is ever
 * loaded, to seed pre-existing rows as already-seen so the admin isn't
 * flooded with dots on day one.
 */
export function useNewItemsTracker(key: string, currentIds: string[] = []) {
  const [viewed, setViewed] = useState<Set<string>>(() => readViewed(key));
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current || typeof window === "undefined") return;

    if (window.localStorage.getItem(seededFlagKey(key))) {
      seededRef.current = true;
      return;
    }
    if (currentIds.length === 0) return; // wait for first real data before seeding

    seededRef.current = true;
    const seeded = new Set(currentIds);
    writeViewed(key, seeded);
    window.localStorage.setItem(seededFlagKey(key), "1");
    setViewed(seeded);
  }, [key, currentIds]);

  const isNew = (id: string) => !viewed.has(id);

  const dismiss = (id: string) => {
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      writeViewed(key, next);
      return next;
    });
  };

  return { isNew, dismiss };
}
