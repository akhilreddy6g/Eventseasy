"use client";

import dynamic from "next/dynamic";
import { MapPinned } from "lucide-react";
import type { EventLocation } from "./content-api";

const InteractiveMap = dynamic(() => import("./interactive-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function MapPreview({
  location,
  className = "",
}: {
  location?: EventLocation | null;
  className?: string;
}) {
  if (!location) {
    return (
      <div
        className={`flex h-[30rem] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground ${className}`}
      >
        <MapPinned className="mr-2 h-5 w-5" />
        No location selected
      </div>
    );
  }

  return (
    <div className={`h-[30rem] overflow-hidden rounded-lg border ${className}`}>
      <InteractiveMap location={location} />
    </div>
  );
}
