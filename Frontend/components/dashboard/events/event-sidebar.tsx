'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Settings,
  MessageSquare,
  Map,
  Image,
  Info,
  MapPin,
} from "lucide-react";
import { UserOctagon } from "@mynaui/icons-react";

export default function EventSidebar() {
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 3).join('/'); 
  const navigation = [
    { name: "Overview", href: "/overview", icon: Info },
    { name: "Guests", href: "/guests", icon: Users },
    { name: "Managers", href: "/managers", icon: UserOctagon },
    { name: "Path to Destination", href: "/destination", icon: MapPin },
    { name: "Landmarks at the Event", href: "/landmarks", icon: Map },
    { name: "Media", href: "/media", icon: Image },
    { name: "Live Chat", href: "/chat", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col w-44 border-r bg-muted/10">
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={`${basePath}${item.href}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
              pathname.endsWith(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
