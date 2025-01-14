"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, LayoutDashboard } from "lucide-react";
import { useState, useLayoutEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: CalendarDays },
];

const events = [
  { name: "ak", href: "/events/ak" },
  { name: "1", href: "/events/1" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);

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
        {navigation.map((item) => (
          <div key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-[16px] font-medium rounded-md",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
              onClick={(e) => {
                if (item.name === "Events") {
                  toggleDropdown();
                }
              }}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
            {isOpen && item.name === "Events" && (
              <div className="ml-6 mt-1">
                {events.map((event) => (
                  <Link
                    key={event.name}
                    href={`${event.href}`}
                    className={cn("block px-3 py-1 text-sm text-muted-foreground rounded-md",
                    pathname.startsWith(event.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted")}
                  >
                    {event.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
