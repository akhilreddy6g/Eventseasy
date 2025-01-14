"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventsAttended } from "./events-attended"

export function EventTabs() {
  return (
    <Tabs defaultValue="attended" className="space-y-4">
      <TabsList>
        <TabsTrigger value="attended">Events Attended</TabsTrigger>
        <TabsTrigger value="managed">Events Managed</TabsTrigger>
        <TabsTrigger value="hosted">Events Hosted</TabsTrigger>
      </TabsList>
      <TabsContent value="attended">
        <EventsAttended />
      </TabsContent>
    </Tabs>
  )
}