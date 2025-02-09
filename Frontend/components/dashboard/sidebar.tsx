"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, LayoutDashboard } from "lucide-react";
import { useState, ReactNode, useEffect} from "react";
import { ChevronRight } from "@mynaui/icons-react";
import { Plus } from "@mynaui/icons-react";


const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/events/summary", icon: CalendarDays },
];

const data = [
  { eventId: "hIetsdg45OODSG9032dfvd", eventName: "Anniversary", action: "Host" },
  { eventId: "Abbftsdg45uiuf8G9032op", eventName: "Graduation", action: "Manage" },
  { eventId: "Aaj943upoduiuf8G9032op", eventName: "Birthday", action: "Attend" },
  { eventId: "Fgh28hdf84jslkj23j0d2sd", eventName: "Wedding", action: "Host" },
  { eventId: "Xcv3iu34dsf29j8qRsdksf2", eventName: "Christmas Party", action: "Manage" },
  { eventId: "Lskdjs94fhsd9238D9f8ndJ", eventName: "New Year Celebration", action: "Attend" },
  { eventId: "O9q8r7t2hsd74df2D1jsld2", eventName: "Charity Gala", action: "Host" },
  { eventId: "Kl34sd90Dfsd92p8D9jfd83", eventName: "Corporate Meetup and Other Stuff", action: "Manage" },
  { eventId: "Am29lsdf8fu923jsd87G7sd", eventName: "Housewarming", action: "Attend" },
  { eventId: "Wsd8f8dsf32d98hf2Jsd9h42", eventName: "Team Building", action: "Host" },
  { eventId: "Ihg82h39jkd9sdhf82Jfksk3", eventName: "Product Launch", action: "Manage" },
  { eventId: "Ejsd9dh2jk23sdjF8hj2sd4", eventName: "Festival Celebration", action: "Attend" },
  { eventId: "Jsd9s8d2fh3sd92f9Lsdksf0", eventName: "Summer Camp", action: "Host" },
  { eventId: "Fgdf82jdsfD6s7fg9Ijd23s", eventName: "Hackathon", action: "Manage" }
];

export function DashboardSidebar(): ReactNode {
  const pathname = usePathname();
  const [events, setEvents] = useState([
    { name: "Events Hosted", action: "Host", href: "/events/hosted", flag: false, eventsData: data.filter((curr)=> curr.action==="Host") },
    { name: "Events Managed", action: "Manage", href: "/events/managed", flag: false, eventsData: data.filter((curr)=> curr.action==="Manage") },
    { name: "Events Attended", action: "Attend", href: "/events/attended", flag: false, eventsData: data.filter((curr)=> curr.action==="Attend") }
  ]);
  const [path, setPath] = useState(pathname.split("/"));

  const changeFlag = (idx: number) => {
    setEvents((prevEvents) =>
      prevEvents.map((event, index) =>
        index === idx ? { ...event, flag: !event.flag } : event
      )
    );
  };

  useEffect(()=>{
    setEventSelected(path?.[3])
    const record= data?.filter((ele)=>ele.eventId===path?.[3])[0]?.action
    setEvents((prevEvents) => 
    prevEvents.map((prev) => 
      prev.action==record? { ...prev, flag: true } : prev
    ))
  }, [path])

  const [eventSelected, setEventSelected] = useState("");

  return (
    <div className="flex flex-col w-48 border-r bg-muted/10 relative">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">EventBuzz</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
           <div key={`nav-item-${item.name}`}>
            <Link
              href={item.href}
              key={`item-link-${item.name}`}
              onClick={()=>{setEventSelected("")}}
              className={cn(
                "flex items-center gap-3 px-1 py-2 text-[17px] text-black rounded-md font-bold",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-black hover:bg-muted"
              )}
            >
              <item.icon key={`item-link-icon-${item.name}`} className="h-5 w-5" />
              {item.name}
            </Link>
          </div>
        ))}
        <div className="mt-1">
            {events.map((event, eventIndex) => (
              <div key={`event-group-${eventIndex}`}>
              <div key={`event-container-${event.action}`} className="flex pl-1 items-center">
                <button className="flex pt-1 hover:bg-muted w-40 rounded-lg" key={`button-${event.action}`} onClick={()=>{changeFlag(eventIndex)}}><ChevronRight/> <p className="pl-2">{event.name}</p></button>
              </div>
              { event.flag && 
                <div>
                  {event.eventsData.length > 0 && event.eventsData.map((curr) => (
                    <Link key={curr.eventId} href={`${event.href}/${curr.eventId}`} onClick={()=>{setEventSelected(curr.eventId)}}>
                      <p className={`flex w-28 ml-7 px-2 py-1 gap-1 text-muted-foreground overflow-scroll ${eventSelected===curr.eventId && 'bg-primary text-white rounded-md'}`}>{curr.eventName}</p>
                    </Link>
                  ))}
                  <Link key={`sub-link-${event.action}`}  href={`/events/${event.action.toLocaleLowerCase()}`} onClick={()=>{setEventSelected(event.action)}}>
                    <div key={`sub-div-${event.action}`} className={`flex pl-1 pt-1 pb-1 gap-1 items-center text-muted-foreground ${eventSelected===event.action ? 'bg-primary text-white rounded-md' : ''}`}>
                      <Plus key={`plus-icon-${event.action}`}/> 
                      <p className="pl-1">{event.action} an Event</p>
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