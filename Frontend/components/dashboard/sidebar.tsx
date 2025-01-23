"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, LayoutDashboard } from "lucide-react";
import { useState, useLayoutEffect } from "react";
import { ChevronRight } from "@mynaui/icons-react";
import { Plus } from "@mynaui/icons-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: CalendarDays },
];

const events = [
  { name: "Events Hosted", action: "Host", href: "/events/hosted" },
  { name: "Events Managed", action: "Manage", href: "/events/managed" },
  { name: "Events Attended", action: "Attend", href: "/events/attended" }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const [toggle, changeToggle] = useState("");

  const setToggle = (currAction: string) => {
    if (currAction==toggle){
      changeToggle("")
    } else {
      changeToggle(currAction)
    }
  }

  useLayoutEffect(()=>{
    if (
      pathname
        .split('/')
        .filter(segment => segment !== "")
        .some(segment => segment === "events")
    ) {
      setIsOpen(true);
    } 
  }, [])

  return (
    <div className="flex flex-col w-48 border-r bg-muted/10 relative">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">EventBuzz</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item, index) => (
           <div key={`nav-item-${item.name}`}>
            <Link
              href={item.href}
              key={`item-link-${item.name}`}
              className={cn(
                "flex items-center gap-3 px-1 py-2 text-[17px] text-black rounded-md font-bold",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-black hover:bg-muted"
              )}
              onClick={(e) => {
                if (item.name === "Events") {
                  toggleDropdown();
                }
              }}
            >
              <item.icon key={`item-link-icon-${item.name}`} className="h-5 w-5" />
              {item.name}
            </Link>
            {isOpen && item.name === "Events" && (
              <div className="mt-1">
                {events.map((event, eventIndex) => (
                  <>
                  <div key={`event-container-${event.action}`} className="flex pl-1 items-center">
                    <button onClick={()=>{setToggle(event.action)}}><ChevronRight /></button>
                    <Link
                       key={`event-link-${event.action}`}
                      href={`${event.href}`}
                      className={cn("block px-1 py-1 text-[15px rounded-md ",
                      pathname.startsWith(event.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-black hover:bg-muted")}
                    >
                      {event.name}
                    </Link>
                  </div>
                  { event.action==toggle && <Link key={`sub-link-${event.action}`} href={`/events/${event.action.toLocaleLowerCase()}`}><div key={`sub-div-${event.action}`} className="flex pl-1 pt-1 pb-1 gap-1 items-center text-muted-foreground"><Plus key={`plus-icon-${event.action}`}/>{event.action} an Event</div></Link>}
                  </>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}