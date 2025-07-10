import EventSidebar from "@/components/dashboard/events/event-sidebar";
import { ReactNode } from "react";
import { apiUrl } from "@/components/constants";
import { cookies } from "next/headers";
import { userEvents } from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";

export default async function EventLayout({
  params,
  children,
}: {
  children: ReactNode;
  params: { event: string };
}) {
  const { event } = await params;
  const cookieStore = cookies().get("accessToken")?.value;
  if (cookieStore) {
    const parsedCookie = JSON.parse(cookieStore);
    const actValue = parsedCookie.act;
    const user = parsedCookie.user;
    const arr = event.split("sstc");
    apiUrl.defaults.headers.common["Authorization"] = actValue;
    if (
      arr[arr.length - 1].length == 1 &&
      (arr[arr.length - 1] == "0" || arr[arr.length - 1] == "1")
    ) {
      const apiRequest = await apiUrl.get(
        `/events/data?user=${user}&status=${arr[arr.length - 1]}`
      );
      const eventId = arr[0];
      const object = apiRequest.data;
      if (object?.success) {
        const objectData: userEvents[] = object.response;
        const checkEvent = objectData.filter(
          (curr) => curr.eventId == eventId && curr.accType == "Host"
        );
        if (checkEvent.length > 0) {
          console.log("Granted host route priveleges to the user!");
          return (
            <div className="flex gap-2">
              <EventSidebar type="host" />
              {children}
            </div>
          );
        }
      }
    }
    console.log("Accessing restricted routes.....redirecting back to events!");
  }
  redirect("/events");
}
