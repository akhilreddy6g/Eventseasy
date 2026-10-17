"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, MapPin, Pencil, Save } from "lucide-react";
import { apiUrl } from "@/components/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  apiError,
  authorizeEventRequests,
  EventLocation,
  EventRole,
} from "./content-api";
import { LocationPicker } from "./location-picker";

type DestinationData = {
  destination: EventLocation | null;
  role: EventRole;
  canEdit: boolean;
};

export function EventDestination({ eventId }: { eventId: string }) {
  const [data, setData] = useState<DestinationData | null>(null);
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState<EventLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      authorizeEventRequests();
      const response = await apiUrl.get(`/events/${eventId}/destination`);
      setData(response.data?.response || null);
    } catch (requestError) {
      setError(apiError(requestError, "Could not load the destination."));
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = () => {
    setLocation(data?.destination || null);
    setEditing(true);
  };
  const save = async () => {
    if (!location) {
      setError("Select and confirm an address before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      authorizeEventRequests();
      const response = await apiUrl.put(`/events/${eventId}/destination`, {
        location,
      });
      setData(response.data?.response || null);
      setEditing(false);
    } catch (requestError) {
      setError(apiError(requestError, "Could not save the destination."));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Card className="flex h-full min-h-[380px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </Card>
    );
  if (!data) return null;
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden shadow-sm">
      <CardHeader className="flex-none border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>Destination</CardTitle>
          <CardDescription>
            Place where the event will take place.
          </CardDescription>
        </div>
        {data.canEdit && (
          <Button onClick={startEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {data.destination ? "Edit destination" : "Set destination"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {error && (
          <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mx-auto max-w-4xl">
          <LocationPicker value={data.destination} editable={false} />
        </div>
      </CardContent>
      <Dialog
        open={editing}
        onOpenChange={(open) => !saving && setEditing(open)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {data.destination ? "Update" : "Set"} destination
            </DialogTitle>
            <DialogDescription>
              Choose an address, review it on the map, then confirm it before
              saving.
            </DialogDescription>
          </DialogHeader>
          <LocationPicker value={location} onChange={setLocation} editable />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || !location}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Check className="mr-2 h-4 w-4" />
              Save destination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
