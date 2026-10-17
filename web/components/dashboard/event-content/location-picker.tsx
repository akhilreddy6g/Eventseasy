"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MapPreview } from "./map-preview";
import { EventLocation, googleMapsUrl } from "./content-api";

type GeoapifyFeature = {
  properties?: { formatted?: string; address_line1?: string; place_id?: string; lat?: number; lon?: number };
};

function normalize(feature: GeoapifyFeature): EventLocation | null {
  const properties = feature.properties || (feature as GeoapifyFeature["properties"]);
  if (!properties || typeof properties.lat !== "number" || typeof properties.lon !== "number") return null;
  return {
    formattedAddress: properties.formatted || properties.address_line1 || "Selected location",
    latitude: properties.lat,
    longitude: properties.lon,
    placeId: properties.place_id,
  };
}

export function LocationPicker({
  value,
  onChange,
  editable,
  label = "Event address",
}: {
  value?: EventLocation | null;
  onChange?: (location: EventLocation) => void;
  editable: boolean;
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EventLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState<EventLocation | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  useEffect(() => {
    if (!editable || query.trim().length < 3 || !apiKey) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
        url.searchParams.set("text", query.trim());
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "5");
        url.searchParams.set("apiKey", apiKey);
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        setResults((data.features || data.results || []).map(normalize).filter(Boolean) as EventLocation[]);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [apiKey, editable, query]);

  const googleUrl = useMemo(() => (value ? googleMapsUrl(value) : ""), [value]);

  if (!editable) {
    return (
      <div className="space-y-3">
        <MapPreview location={value} />
        {value ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href={googleUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Open in Google Maps</a>
          </Button>
        ) : <p className="text-sm text-muted-foreground">The host has not added a destination yet.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium" htmlFor="event-location-search">{label}</label>
      {!apiKey && <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">Add <code>NEXT_PUBLIC_GEOAPIFY_API_KEY</code> to enable address search.</p>}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input id="event-location-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an address, venue, or landmark" className="pl-9" autoComplete="off" disabled={!apiKey} />
        {loading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {results.length > 0 && (
        <div className="overflow-hidden rounded-md border bg-background shadow-sm">
          {results.map((result) => <button key={`${result.placeId}-${result.latitude}-${result.longitude}`} type="button" onClick={() => { setCandidate(result); setResults([]); }} className="flex w-full items-start gap-3 border-b p-3 text-left text-sm last:border-0 hover:bg-muted/60"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{result.formattedAddress}</button>)}
        </div>
      )}
      <MapPreview location={candidate || value} />
      {value && <p className="text-sm text-muted-foreground">Selected: <span className="text-foreground">{value.formattedAddress}</span></p>}
      <AlertDialog open={Boolean(candidate)} onOpenChange={(open) => !open && setCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Use this location?</AlertDialogTitle><AlertDialogDescription>{candidate?.formattedAddress}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>No, keep searching</AlertDialogCancel><AlertDialogAction onClick={() => { if (candidate) onChange?.(candidate); setCandidate(null); setQuery(""); }}>Yes, use this address</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
