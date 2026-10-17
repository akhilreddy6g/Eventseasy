"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  FileImage,
  Loader2,
  Pencil,
  Save,
  Upload,
  CalendarDays,
  Clock,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  apiError,
  authorizeEventRequests,
  deliveryUrl,
  EventAsset,
  EventRole,
  uploadEventImage,
} from "./content-api";

type EventSchedule = {
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

type Overview = {
  title: string;
  information: string;
  image: EventAsset | null;
  schedule?: EventSchedule;
  role: EventRole;
  canEdit: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateRange(schedule?: EventSchedule) {
  const start = formatDate(schedule?.startDate);
  const end = formatDate(schedule?.endDate);

  if (!start && !end) return "To be announced";
  if (!end || start === end) return start;
  return `${start} – ${end}`;
}

function formatTime(value?: string | null) {
  if (!value) return "";

  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;

  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTimeRange(schedule?: EventSchedule) {
  const start = formatTime(schedule?.startTime);
  const end = formatTime(schedule?.endTime);

  if (!start && !end) return "To be announced";
  if (!end) return start;
  return `${start} – ${end}`;
}

export function EventOverview({ eventId }: { eventId: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [information, setInformation] = useState("");
  const [image, setImage] = useState<EventAsset | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      authorizeEventRequests();
      const response = await apiUrl.get(`/events/${eventId}/overview`);
      setOverview(response.data?.response || null);
    } catch (requestError) {
      setError(apiError(requestError, "Could not load this event overview."));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const beginEdit = () => {
    setTitle(overview?.title || "");
    setInformation(overview?.information || "");
    setImage(overview?.image || null);
    setEditOpen(true);
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      setImage(await uploadEventImage(eventId, "overview", file));
    } catch (uploadError) {
      setError(apiError(uploadError, "Could not upload the invitation image."));
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      authorizeEventRequests();
      const response = await apiUrl.put(`/events/${eventId}/overview`, {
        title,
        information,
        image,
      });
      setOverview(response.data?.response || null);
      setEditOpen(false);
    } catch (requestError) {
      setError(apiError(requestError, "Could not save the event overview."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingCard />;
  if (!overview) return <LoadingCard />;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden shadow-sm">
      <CardHeader className="flex-none border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>Overview</CardTitle>
          <CardDescription>Event invitation and information.</CardDescription>
        </div>
        {overview.canEdit && (
          <Button onClick={beginEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit overview
          </Button>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {error && (
          <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.55fr)]">
          <section className="rounded-xl border bg-muted/20 p-3 shadow-inner">
            {overview.image ? (
              <div className="flex h-[calc(100vh-16rem)] min-h-[32rem] items-center justify-center overflow-hidden rounded-lg bg-black/5 p-4">
                <img
                  src={deliveryUrl(overview.image.deliveryPath)}
                  alt={overview.title}
                  className="block max-h-full max-w-full rounded-md object-contain"
                />
              </div>
            ) : (
              <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-lg border border-dashed bg-background text-center text-muted-foreground">
                <FileImage className="mb-3 h-10 w-10" />
                <p className="font-medium text-foreground">
                  Invitation image coming soon
                </p>
                <p className="mt-1 text-sm">
                  Add one to give guests a visual preview of the event.
                </p>
              </div>
            )}
          </section>

          <aside className="self-start xl:sticky xl:top-0">
            <article className="overflow-hidden rounded-xl border bg-background shadow-sm">
              <div className="p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  About this event
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight">
                  {overview.title}
                </h1>

                <dl className="mt-7 space-y-5 border-y py-5">
                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Date
                      </dt>
                      <dd className="mt-1 text-sm font-medium leading-6">
                        {formatDateRange(overview.schedule)}
                      </dd>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Time
                      </dt>
                      <dd className="mt-1 text-sm font-medium leading-6">
                        {formatTimeRange(overview.schedule)}
                      </dd>
                    </div>
                  </div>
                </dl>

                <section className="mt-6">
                  <h2 className="text-sm font-semibold">Event information</h2>
                  <div className="mt-3 max-h-[28vh] overflow-y-auto whitespace-pre-wrap pr-2 text-sm leading-7 text-muted-foreground">
                    {overview.information ||
                      "The host has not added event information yet."}
                  </div>
                </section>
              </div>
            </article>
          </aside>
        </div>
      </CardContent>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => !saving && setEditOpen(open)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit event overview</DialogTitle>
            <DialogDescription>
              Saving the title also updates the event name shown across
              Eventseasy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="overview-title">
                Event title
              </label>
              <Input
                id="overview-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={140}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="overview-info">
                Information
              </label>
              <Textarea
                id="overview-info"
                value={information}
                onChange={(event) => setInformation(event.target.value)}
                rows={8}
                maxLength={12000}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Invitation image</p>
              {image && (
                <img
                  src={deliveryUrl(image.deliveryPath)}
                  alt="Selected invitation"
                  className="mb-3 max-h-48 rounded-md border object-contain"
                />
              )}
              <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed p-5 text-sm text-muted-foreground hover:bg-muted/40">
                <Upload className="mr-2 h-4 w-4" />
                Upload an image (up to 5 MB)
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={upload}
                  disabled={saving}
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || !title.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card className="flex h-full min-h-[380px] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </Card>
  );
}
