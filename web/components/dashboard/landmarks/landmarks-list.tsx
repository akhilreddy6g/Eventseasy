"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus } from "lucide-react"

const landmarks = [
  {
    id: 1,
    name: "Main Entrance",
    directions: "Enter through the glass doors at the front of the building",
    photoUrl: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80&w=300&h=200",
  },
  // Add more landmarks...
]

export function LandmarksList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Landmarks</CardTitle>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Landmark
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {landmarks.map((landmark) => (
            <Card key={landmark.id}>
              <CardContent className="p-4">
                {landmark.photoUrl && (
                  <img
                    src={landmark.photoUrl}
                    alt={landmark.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-semibold flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {landmark.name}
                </h3>
                {landmark.directions && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {landmark.directions}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}