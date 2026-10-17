import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  if (!cookies().get("accessToken")) redirect("/login");
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0,_transparent_42%)] p-6">
      <section className="w-full max-w-xl rounded-2xl border bg-background/90 p-8 text-center shadow-xl backdrop-blur sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Compass className="h-8 w-8" />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          This page isn’t on the itinerary.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
          The link may be outdated, or the page may have been moved. Your event
          data is safe—let’s get you back to your events.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to events
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
