"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  ImagePlus,
  ListChecks,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  apiError,
  authorizeEventRequests,
  deliveryUrl,
  EventAsset,
  EventLocation,
  EventRole,
  googleMapsUrl,
  uploadEventImage,
} from "./content-api";
import { LocationPicker } from "./location-picker";

type Landmark = {
  id: string;
  title: string;
  information: string;
  location: EventLocation | null;
  image: EventAsset | null;
};
type LandmarkData = { items: Landmark[]; role: EventRole; canEdit: boolean };
type Draft = {
  title: string;
  information: string;
  location: EventLocation | null;
  image: EventAsset | null;
};

const emptyDraft = (): Draft => ({
  title: "",
  information: "",
  location: null,
  image: null,
});

export function EventLandmarks({ eventId }: { eventId: string }) {
  const [data, setData] = useState<LandmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Landmark | null | "new">(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      authorizeEventRequests();
      const response = await apiUrl.get(`/events/${eventId}/landmarks`);
      setData(response.data?.response || null);
    } catch (requestError) {
      setError(apiError(requestError, "Could not load landmarks."));
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setDraft(emptyDraft());
    setEditing("new");
  };
  const openEdit = (landmark: Landmark) => {
    setDraft({
      title: landmark.title,
      information: landmark.information,
      location: landmark.location,
      image: landmark.image,
    });
    setEditing(landmark);
  };
  const toggle = (id: string, checked: boolean) =>
    setSelected((previous) => {
      const next = new Set(previous);
      checked ? next.add(id) : next.delete(id);
      return next;
    });

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const image = await uploadEventImage(eventId, "landmark", file);
      setDraft((current) => ({ ...current, image }));
    } catch (uploadError) {
      setError(apiError(uploadError, "Could not upload the landmark image."));
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setError("A landmark name is required.");
      return;
    }
    setSaving(true);
    setError("");
    const body = {
      title: draft.title,
      information: draft.information,
      location: draft.location,
      image: draft.image,
    };
    try {
      authorizeEventRequests();
      if (editing === "new")
        await apiUrl.post(`/events/${eventId}/landmarks`, body);
      else if (editing)
        await apiUrl.put(`/events/${eventId}/landmarks/${editing.id}`, body);
      setEditing(null);
      await load();
    } catch (requestError) {
      setError(apiError(requestError, "Could not save the landmark."));
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = async () => {
    setDeleting(true);
    try {
      authorizeEventRequests();
      await apiUrl.delete(`/events/${eventId}/landmarks`, {
        data: { ids: [...selected] },
      });
      setSelected(new Set());
      setSelectMode(false);
      setDeleteOpen(false);
      await load();
    } catch (requestError) {
      setError(
        apiError(requestError, "Could not delete the selected landmarks."),
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <Card className="flex h-full min-h-[380px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </Card>
    );
  if (!data) return null;
  const editOpen = editing !== null;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden shadow-sm">
      <CardHeader className="flex-none gap-4 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>Landmarks</CardTitle>
          <CardDescription>Memorable spots around the event.</CardDescription>
        </div>
        {data.canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectMode((value) => !value);
                setSelected(new Set());
              }}
            >
              <ListChecks className="mr-2 h-4 w-4" />
              {selectMode ? "Cancel" : "Select"}
            </Button>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add landmark
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {error && (
          <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {data.items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((landmark) => (
              <LandmarkCard
                key={landmark.id}
                landmark={landmark}
                editable={data.canEdit}
                selectMode={selectMode}
                selected={selected.has(landmark.id)}
                onSelect={toggle}
                onEdit={openEdit}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground">
            <MapPin className="mb-3 h-9 w-9" />
            <p className="font-medium text-foreground">No landmarks yet</p>
            <p className="mt-1 text-sm">
              Add practical or memorable spots to help everyone navigate the
              event.
            </p>
            {data.canEdit && (
              <Button className="mt-4" onClick={openNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add the first landmark
              </Button>
            )}
          </div>
        )}
      </CardContent>
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} landmark{selected.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will be marked inactive and no longer appear for event
              members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteSelected}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => !saving && !open && setEditing(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? "Add a landmark" : "Edit landmark"}
            </DialogTitle>
            <DialogDescription>
              Save a clear name, optional image, useful details, and an optional
              precise pin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="landmark-title">
                Landmark name
              </label>
              <Input
                id="landmark-title"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                maxLength={120}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="landmark-info">
                About this landmark
              </label>
              <Textarea
                id="landmark-info"
                value={draft.information}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    information: event.target.value,
                  }))
                }
                rows={4}
                maxLength={4000}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">
                Photo <span className="text-muted-foreground">(optional)</span>
              </p>
              {draft.image ? (
                <img
                  src={deliveryUrl(draft.image.deliveryPath)}
                  alt="Selected landmark"
                  className="mb-3 max-h-52 rounded-md border object-contain"
                />
              ) : null}
              <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted/40">
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload or replace image
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={upload}
                  disabled={saving}
                />
              </label>
            </div>
            <LocationPicker
              label="Precise landmark location (optional)"
              value={draft.location}
              onChange={(location) =>
                setDraft((current) => ({ ...current, location }))
              }
              editable
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || !draft.title.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save landmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function LandmarkCard({
  landmark,
  editable,
  selectMode,
  selected,
  onSelect,
  onEdit,
}: {
  landmark: Landmark;
  editable: boolean;
  selectMode: boolean;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (landmark: Landmark) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] bg-muted">
        {landmark.image ? (
          <img
            src={deliveryUrl(landmark.image.deliveryPath)}
            alt={landmark.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
            <ImagePlus className="h-9 w-9" />
          </div>
        )}
        {landmark.location && (
          <a
            href={googleMapsUrl(landmark.location)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${landmark.title} in Google Maps`}
            className="absolute right-3 top-3 rounded-full bg-background/95 p-2 text-primary shadow-sm transition-transform hover:scale-105"
          >
            <MapPin className="h-4 w-4" />
          </a>
        )}
        {selectMode && (
          <div className="absolute left-3 top-3 rounded bg-background/95 p-1.5 shadow-sm">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) =>
                onSelect(landmark.id, checked === true)
              }
              aria-label={`Select ${landmark.title}`}
            />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{landmark.title}</h2>
          {editable && !selectMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(landmark)}
              aria-label={`Edit ${landmark.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {landmark.information || "No additional information yet."}
        </p>
        {landmark.location && (
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {landmark.location.formattedAddress}
          </p>
        )}
      </div>
    </article>
  );
}
