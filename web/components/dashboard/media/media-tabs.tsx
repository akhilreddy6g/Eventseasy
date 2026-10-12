"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/components/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

type MediaType = "image" | "video";
type Role = "Host" | "Manage" | "Attend";

type MediaItem = {
  id: string;
  mediaType: MediaType;
  deliveryPath: string;
  uploaderName?: string;
  canDelete: boolean;
  isUploader: boolean;
};

type UploadIntent = {
  mediaId: string;
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  publicId: string;
  type: string;
  overwrite: boolean;
};

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 40 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 10;
const DELETE_BATCH_SIZE = 100;

function chunks<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size)
    groups.push(items.slice(index, index + size));
  return groups;
}

function apiErrorMessage(error: unknown, fallback: string) {
  const maybeError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return maybeError.response?.data?.message || maybeError.message || fallback;
}

function deliveryUrl(path: string) {
  const origin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  return `${origin}${path}`;
}

export function MediaTabs({ eventId }: { eventId: string }) {
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    complete: 0,
    total: 0,
  });
  const fileInput = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("authorization");
      if (token) apiUrl.defaults.headers.common["Authorization"] = token;
      const response = await apiUrl.get(`/events/${eventId}/media`, {
        params: { type: mediaType },
      });
      const payload = response.data?.response;
      setItems(payload?.items || []);
      setRole(payload?.role || null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Could not load event media."));
    } finally {
      setLoading(false);
    }
  }, [eventId, mediaType]);

  useEffect(() => {
    setSelected(new Set());
    setSelectMode(false);
    void loadMedia();
  }, [loadMedia]);

  const toggleSelected = (id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const validateFiles = (files: File[]) => {
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of files) {
      if (file.type.startsWith("image/") && file.size <= IMAGE_MAX_BYTES)
        accepted.push(file);
      else if (file.type.startsWith("video/") && file.size <= VIDEO_MAX_BYTES)
        accepted.push(file);
      else if (file.type.startsWith("image/"))
        rejected.push(`${file.name} is larger than 5 MB`);
      else if (file.type.startsWith("video/"))
        rejected.push(`${file.name} is larger than 40 MB`);
      else rejected.push(`${file.name} is not an image or video`);
    }
    return { accepted, rejected };
  };

  const uploadFile = async (file: File, intent: UploadIntent) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", intent.apiKey);
    form.append("timestamp", String(intent.timestamp));
    form.append("signature", intent.signature);
    form.append("public_id", intent.publicId);
    form.append("type", intent.type);
    form.append("overwrite", String(intent.overwrite));

    const cloudinaryResponse = await fetch(intent.uploadUrl, {
      method: "POST",
      body: form,
    });
    if (!cloudinaryResponse.ok)
      throw new Error(`Cloudinary rejected ${file.name}`);
    await apiUrl.post(`/events/${eventId}/media/${intent.mediaId}/complete`);
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files || []);
    event.target.value = "";
    const { accepted, rejected } = validateFiles(fileList);
    if (!accepted.length) {
      setError(rejected[0] || "Choose an image or video to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress({ complete: 0, total: accepted.length });
    setError(rejected.length ? rejected.join(". ") : "");
    let failed = 0;
    let complete = 0;

    // Each signature request and direct-upload group stays at the agreed 10-item concurrency limit.
    for (const group of chunks(accepted, UPLOAD_CONCURRENCY)) {
      try {
        const intentResponse = await apiUrl.post(
          `/events/${eventId}/media/upload-intents`,
          {
            files: group.map((file) => ({
              mimeType: file.type,
              bytes: file.size,
            })),
          },
        );
        const intents: UploadIntent[] =
          intentResponse.data?.response?.items || [];
        if (intents.length !== group.length)
          throw new Error("The upload service did not prepare every file");
        const settled = await Promise.allSettled(
          group.map((file, index) => uploadFile(file, intents[index])),
        );
        for (const upload of settled) {
          complete += 1;
          if (upload.status === "rejected") failed += 1;
          setUploadProgress({ complete, total: accepted.length });
        }
      } catch (uploadError) {
        failed += group.length;
        complete += group.length;
        setUploadProgress({ complete, total: accepted.length });
        setError(
          apiErrorMessage(uploadError, "Some media could not be uploaded."),
        );
      }
    }

    setUploading(false);
    if (!failed) setUploadOpen(false);
    if (failed)
      setError(
        `${failed} item${failed === 1 ? "" : "s"} could not be uploaded.`,
      );
    await loadMedia();
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    setDeleting(true);
    let failures = 0;
    try {
      for (const group of chunks(ids, DELETE_BATCH_SIZE)) {
        const response = await apiUrl.delete(`/events/${eventId}/media`, {
          data: { ids: group },
        });
        failures += response.data?.response?.failedIds?.length || 0;
      }
      setSelected(new Set());
      setSelectMode(false);
      setDeleteOpen(false);
      if (failures)
        setError(
          `${failures} item${failures === 1 ? "" : "s"} could not be deleted.`,
        );
      await loadMedia();
    } catch (requestError) {
      setError(
        apiErrorMessage(requestError, "Could not delete the selected media."),
      );
    } finally {
      setDeleting(false);
    }
  };

  const groupedItems = () => {
    const groups = new Map<string, MediaItem[]>();
    for (const item of items) {
      const name = item.isUploader ? "You" : item.uploaderName || "Deleted";
      groups.set(name, [...(groups.get(name) || []), item]);
    }
    return Array.from(groups.entries());
  };

  const showUploaderGroups = role === "Host" || role === "Manage";
  const selectedCount = selected.size;

  return (
    <Card className="flex-1">
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Media Gallery</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectMode((enabled) => !enabled);
              setSelected(new Set());
            }}
          >
            <ListChecks className="mr-2 h-4 w-4" />
            {selectMode ? "Cancel" : "Select"}
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={mediaType}
          onValueChange={(value) => setMediaType(value as MediaType)}
        >
          <TabsList>
            <TabsTrigger value="image">
              <ImageIcon className="mr-2 h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="mr-2 h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 pt-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : !items.length ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            {mediaType === "image" ? (
              <ImageIcon className="h-9 w-9" />
            ) : (
              <Video className="h-9 w-9" />
            )}
            <div>
              <p className="font-medium text-foreground">
                No {mediaType === "image" ? "photos" : "videos"} yet
              </p>
              <p className="text-sm">Be the first event member to share one.</p>
            </div>
            <Button variant="outline" onClick={() => setUploadOpen(true)}>
              Upload media
            </Button>
          </div>
        ) : showUploaderGroups ? (
          <div className="space-y-8 pt-5">
            {groupedItems().map(([name, group]) => (
              <section key={name}>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-sm font-semibold">{name}</h2>
                  <Separator className="flex-1" />
                </div>
                <MediaGrid
                  items={group}
                  selectMode={selectMode}
                  selected={selected}
                  onToggle={toggleSelected}
                />
              </section>
            ))}
          </div>
        ) : (
          <div className="pt-5">
            <MediaGrid
              items={items}
              selectMode={selectMode}
              selected={selected}
              onToggle={toggleSelected}
            />
          </div>
        )}
      </CardContent>

      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => !uploading && setUploadOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload event media</DialogTitle>
            <DialogDescription>
              Share photos up to 5 MB and videos up to 40 MB. Media is visible
              only to active event members.
            </DialogDescription>
          </DialogHeader>
          {uploading ? (
            <div className="space-y-3 py-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uploading securely</span>
                <span>
                  {uploadProgress.complete} / {uploadProgress.total}
                </span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-secondary"
                aria-label="Upload progress"
              >
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${uploadProgress.total ? (uploadProgress.complete / uploadProgress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex min-h-[150px] w-full flex-col items-center justify-center rounded-md border border-dashed p-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <Upload className="mb-3 h-6 w-6 text-foreground" />
              <span className="font-medium text-foreground">
                Choose photos or videos
              </span>
              <span className="mt-1">Up to 10 files upload concurrently</span>
            </button>
          )}
          <input
            ref={fileInput}
            className="hidden"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFiles}
            disabled={uploading}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectMode && selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
          <span className="whitespace-nowrap text-sm font-medium">
            {selectedCount} selected
          </span>
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
              Delete {selectedCount} item{selectedCount === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the selected media from the event
              gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end space-x-2">
            <AlertDialogCancel className="mt-0" disabled={deleting}>
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSelected}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function MediaGrid({
  items,
  selectMode,
  selected,
  onToggle,
}: {
  items: MediaItem[];
  selectMode: boolean;
  selected: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <article
          key={item.id}
          className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
        >
          {item.mediaType === "image" ? (
            <img
              src={deliveryUrl(item.deliveryPath)}
              alt="Event upload"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              src={deliveryUrl(item.deliveryPath)}
              controls
              preload="metadata"
              className="h-full w-full object-cover"
              aria-label="Event video upload"
            />
          )}
          {selectMode && (
            <div className="absolute left-2 top-2 rounded bg-background/90 p-1 shadow-sm">
              <Checkbox
                checked={selected.has(item.id)}
                disabled={!item.canDelete}
                onCheckedChange={(checked) =>
                  onToggle(item.id, checked === true)
                }
                aria-label={
                  item.canDelete
                    ? `Select media ${item.id}`
                    : "You do not have permission to delete this media"
                }
              />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
