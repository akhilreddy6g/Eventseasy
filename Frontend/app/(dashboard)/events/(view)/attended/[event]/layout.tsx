import EventSidebar from "@/components/dashboard/events/event-sidebar";
import { ReactNode } from "react";

export default function EventLayout({children} : {children : ReactNode}){
    return (
        <div className="flex gap-2">
          <EventSidebar type="guest"/>
          {children}
        </div>
        )
}