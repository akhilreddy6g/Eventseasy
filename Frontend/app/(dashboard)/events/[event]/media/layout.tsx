import EventSidebar from "@/components/dashboard/events/event-sidebar";
  
export default function guestsLayout({
    children,
    }: {
    children: React.ReactNode
    }) {
    return (
        <div className="min-h-screen flex gap-2">
       <EventSidebar/>
       {children}
        </div>
    )
}