"use client";

export default function NewPulseDot() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0" title="New">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: "#F1913D" }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ backgroundColor: "#F1913D" }}
      />
    </span>
  );
}
