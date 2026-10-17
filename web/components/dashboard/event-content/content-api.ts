"use client";

import { apiUrl } from "@/components/constants";

export type EventRole = "Host" | "Manage" | "Attend";

export type EventLocation = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
};

export type EventAsset = {
  id: string;
  deliveryPath: string;
  width?: number;
  height?: number;
  bytes?: number;
};

export function authorizeEventRequests() {
  const token = sessionStorage.getItem("authorization");
  if (token) apiUrl.defaults.headers.common.Authorization = token;
}

export function apiError(error: unknown, fallback: string) {
  const typed = error as { response?: { data?: { message?: string } }; message?: string };
  return typed.response?.data?.message || typed.message || fallback;
}

export function deliveryUrl(path?: string) {
  if (!path) return "";
  const origin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  return `${origin}${path}`;
}

/** Direct, signed image upload used by Overview and Landmark forms. */
export async function uploadEventImage(
  eventId: string,
  kind: "overview" | "landmark",
  file: File,
): Promise<EventAsset> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");
  authorizeEventRequests();
  const intentResponse = await apiUrl.post(`/events/${eventId}/assets/upload-intents`, {
    kind,
    mimeType: file.type,
    bytes: file.size,
  });
  const intent = intentResponse.data?.response;
  if (!intent?.assetId) throw new Error("The image upload could not be prepared.");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", intent.apiKey);
  form.append("timestamp", String(intent.timestamp));
  form.append("signature", intent.signature);
  form.append("public_id", intent.publicId);
  form.append("asset_folder", intent.assetFolder);
  form.append("type", intent.type);
  form.append("overwrite", String(intent.overwrite));
  const uploadResponse = await fetch(intent.uploadUrl, { method: "POST", body: form });
  if (!uploadResponse.ok) throw new Error("Cloudinary rejected the image upload.");
  const completeResponse = await apiUrl.post(
    `/events/${eventId}/assets/${intent.assetId}/complete`,
    { kind },
  );
  return completeResponse.data?.response as EventAsset;
}

export function googleMapsUrl(location: EventLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location.latitude},${location.longitude}`,
  )}`;
}
