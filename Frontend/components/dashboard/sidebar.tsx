"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, LayoutDashboard } from "lucide-react";
import { useState, ReactNode, useEffect, useRef} from "react";
import { ChevronRight } from "@mynaui/icons-react";
import { Plus } from "@mynaui/icons-react";
import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../noncomponents";
import { useMemo } from "react";

interface eventDetails {
  _id: string
  event: string
}

interface userEvents {
  _id: string
  user: string
  accType: string
  eventId: string
  eventData: eventDetails []
}

interface dataFormat {
  eventId: string
  eventName: string
  action: string
}

export function DashboardSidebar(): ReactNode {
  const pathname = usePathname();
  const [path, setPath] = useState(pathname.split("/"));
  const [eventSelected, setEventSelected] = useState("");

  const [events, setEvents] = useState([
    { name: "Events Hosted", action: "Host", href: "/events/hosted", flag: false, eventsData: [] },
    { name: "Events Managed", action: "Manage", href: "/events/managed", flag: false, eventsData: [] },
    { name: "Events Attended", action: "Attend", href: "/events/attended", flag: false, eventsData: []}
  ]);

  const routes = {hosted: "Host", attended: "Attend", managed: "Manage"}

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Events", href: "/events/summary", icon: CalendarDays },
  ];
  
  const fetchData = async () => {
    if(sessionStorage.getItem("authorization")){
      apiUrl.defaults.headers.common["Authorization"] = sessionStorage.getItem("authorization");
    };
    const res = await apiUrl.get("/events/data");
    return res.data
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["data"],
    queryFn: fetchData,
    retry: false
  })

  const mappedData = useMemo(() => {
    return data?.data?.map((curr: userEvents) => ({
      eventId: curr?.eventId,
      eventName: curr?.eventData?.[0]?.event,
      action: curr?.accType
    })) || [];
  }, [data]); 

  const [fetchedData, changeData] = useState(mappedData);

  useEffect(() => {
    setEventSelected(path?.[3])
    let action = ''
    if (path?.[2] in routes){
      action = routes[path[2] as keyof typeof routes]
    }
    if (mappedData.length > 0) {
      setEvents((prevEvents) =>
        prevEvents.map(event => ({
          ...event,
          flag: event.action === action,
          eventsData: mappedData.filter((curr: dataFormat) => curr.action === event.action)
        }))
      );
    }
  }, [path, mappedData]);

  const changeFlag = (idx: number) => {
    setEvents((prevEvents) =>
      prevEvents?.map((event, index) =>
        index === idx ? { ...event, flag: !event?.flag } : event
      )
    );
  };

  return (
    <div className="flex flex-col w-48 border-r bg-muted/10 relative">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">EventBuzz</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation?.map((item) => (
           <div key={`nav-item-${item?.name}`}>
            <Link
              href={item?.href}
              key={`item-link-${item?.name}`}
              onClick={()=>{setEventSelected("")}}
              className={cn(
                "flex items-center gap-3 px-1 py-2 text-[17px] text-black rounded-md font-bold",
                pathname === item?.href
                  ? "bg-primary text-primary-foreground"
                  : "text-black hover:bg-muted"
              )}
            >
              <item.icon key={`item-link-icon-${item?.name}`} className="h-5 w-5" />
              {item?.name}
            </Link>
          </div>
        ))}
        <div className="mt-1">
            {events?.map((event, eventIndex) => (
              <div key={`event-group-${eventIndex}`}>
              <div key={`event-container-${event?.action}`} className="flex pl-1 items-center">
                <button className="flex pt-1 hover:bg-muted w-40 rounded-lg" key={`button-${event.action}`} onClick={()=>{changeFlag(eventIndex)}}><ChevronRight/> <p className="pl-2">{event.name}</p></button>
              </div>
              { event?.flag && 
                <div>
                  {event?.eventsData?.length > 0 && event?.eventsData?.map((curr: dataFormat) => (
                    <Link key={curr?.eventId} href={`${event?.href}/${curr?.eventId}`} onClick={()=>{setEventSelected(curr?.eventId)}}>
                      <p className={`flex w-28 ml-7 px-2 py-1 gap-1 text-muted-foreground rounded-md overflow-scroll ${eventSelected===curr?.eventId ? 'bg-primary text-white rounded-md' : 'hover:bg-muted'}`}>{curr.eventName}</p>
                    </Link>
                  ))}
                  <Link key={`sub-link-${event?.action}`}  href={`/events/${event?.action?.toLocaleLowerCase()}`} onClick={()=>{setEventSelected(event?.action)}}>
                    <div key={`sub-div-${event?.action}`} className={`flex pl-1 pt-1 pb-1 gap-1 items-center rounded-md text-muted-foreground ${eventSelected===event?.action ? 'bg-primary text-white rounded-md' : 'hover:bg-muted'}`}>
                      <Plus key={`plus-icon-${event?.action}`}/> 
                      <p className="pl-1">{event?.action} an Event</p>
                      </div>
                  </Link>
                </div>
              }
              </div>
            ))}
        </div>
      </nav>
    </div>
  );
}