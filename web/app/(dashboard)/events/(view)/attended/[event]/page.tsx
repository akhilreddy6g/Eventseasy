import { redirect } from "next/navigation";

export default function EventLandingPage({
  params,
}: {
  params: { event: string };
}) {
  redirect(`/events/attended/${params.event}/overview`);
}
