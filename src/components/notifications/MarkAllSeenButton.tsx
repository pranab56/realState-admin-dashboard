"use client";

import { CheckCheck } from "lucide-react";

/**
 * Contextual action shown above a management table when there are unseen
 * rows on that page. Clears every row's NewPulseDot and the matching
 * sidebar/header unread count for that module in one click.
 */
export default function MarkAllSeenButton({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  if (count <= 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold border cursor-pointer transition-colors hover:bg-orange-50"
      style={{ borderColor: "#F1913D", color: "#F1913D" }}
    >
      <CheckCheck className="w-4 h-4" />
      Mark All as Seen ({count})
    </button>
  );
}
