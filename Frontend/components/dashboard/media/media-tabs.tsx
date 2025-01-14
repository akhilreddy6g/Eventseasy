"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, Video, Upload } from "lucide-react"

export function MediaTabs() {
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Media Gallery</CardTitle>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Media
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="photos">
          <TabsList>
            <TabsTrigger value="photos">
              <Image className="mr-2 h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="mr-2 h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="photos" className="mt-4">
            {/* Photo grid */}
          </TabsContent>
          <TabsContent value="videos" className="mt-4">
            {/* Video grid */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}