"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/components/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiError, authorizeEventRequests, EventRole } from "./content-api";

type Access = { role: EventRole; canEdit: boolean };

export function EventSettings({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [access, setAccess] = useState<Access | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [firstConfirm, setFirstConfirm] = useState(false);
  const [secondConfirm, setSecondConfirm] = useState(false);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { authorizeEventRequests(); const response = await apiUrl.get(`/events/${eventId}/access`); setAccess(response.data?.response || null); }
    catch (requestError) { setError(apiError(requestError, "Could not load event settings.")); }
    finally { setLoading(false); }
  }, [eventId]);
  useEffect(() => { void load(); }, [load]);

  const isHost = access?.role === "Host";
  const finish = async () => {
    setWorking(true); setError("");
    try {
      authorizeEventRequests();
      if (isHost) await apiUrl.delete(`/events/${eventId}`);
      else await apiUrl.delete(`/events/${eventId}/membership`);
      router.replace("/events"); router.refresh();
    } catch (requestError) { setError(apiError(requestError, isHost ? "Could not delete the event." : "Could not exit the event.")); }
    finally { setWorking(false); }
  };

  if (loading) return <Card className="flex h-full min-h-[320px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></Card>;
  if (!access) return null;
  const buttonLabel = isHost ? "Delete Event and Data" : "Exit Event and Delete Data";
  const title = isHost ? "Delete this event" : "Exit this event";
  const description = isHost ? "This marks the event and every event-scoped record inactive. Cloudinary assets remain retained for deliberate cleanup." : "This revokes your event access and marks only your event-specific records and uploads inactive.";
  return <Card className="flex h-full min-h-0 flex-col overflow-hidden shadow-sm"><CardHeader className="border-b bg-muted/20"><CardTitle>Event settings</CardTitle><CardDescription>Manage your membership and the event lifecycle.</CardDescription></CardHeader><CardContent className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"><section className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/[0.03] p-6"><div className="flex gap-4"><AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" /><div><h2 className="font-semibold text-destructive">Danger zone</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><Button className="mt-5" variant="destructive" onClick={() => setFirstConfirm(true)}><Trash2 className="mr-2 h-4 w-4" />{buttonLabel}</Button></div></div></section>{error && <p className="mx-auto mt-4 max-w-2xl rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}</CardContent>
    <AlertDialog open={firstConfirm} onOpenChange={setFirstConfirm}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}?</AlertDialogTitle><AlertDialogDescription>{isHost ? "Everyone will immediately lose access to this event and its event-scoped documents will be marked inactive." : "You will immediately lose access to this event."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={working}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { setFirstConfirm(false); setSecondConfirm(true); }} disabled={working}>{isHost ? "Continue" : "Yes, exit event"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={secondConfirm} onOpenChange={setSecondConfirm}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{isHost ? "This action cannot be undone" : "Confirm exit"}</AlertDialogTitle><AlertDialogDescription>{isHost ? "The event will no longer be available to any member. You may keep retained Cloudinary files for a later deliberate cleanup, but the application will not serve them." : "Your access, membership record, and uploads for this event will be inactive."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={working}>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={finish} disabled={working}>{working && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isHost ? "Yes, permanently deactivate" : "Yes, exit and deactivate my data"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </Card>;
}
