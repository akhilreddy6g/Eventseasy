import { redirect } from "next/navigation";

export default function EventLandingPage({
  params,
}: {
  params: { event: string };
}) {
  redirect(`/events/managed/${params.event}/overview`);
}
