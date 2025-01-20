"use client"

import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import LogoutButton from "../ui/logout"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-6">
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem className={cn("pl-5")}>Profile</DropdownMenuItem>
                <DropdownMenuItem className={cn("pl-5")}>Settings</DropdownMenuItem>
                <DropdownMenuItem className={cn("pl-5")}><LogoutButton/></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}