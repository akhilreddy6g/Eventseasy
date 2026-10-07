import { Metadata } from "next"
import { LandmarksList } from "@/components/dashboard/landmarks/landmarks-list"
import { PathToDestination } from "@/components/dashboard/landmarks/path-to-destination"

export const metadata: Metadata = {
  title: "Landmarks - Eventseasy",
  description: "Manage event locations and landmarks",
}

export default function LandmarksPage() {
  return (
    <div className="space-y-8 flex-1">
      <LandmarksList />
      <PathToDestination />
    </div>
  )
}