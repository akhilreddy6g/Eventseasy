import { Metadata } from "next"
import { MediaTabs } from "@/components/dashboard/media/media-tabs"

export const metadata: Metadata = {
  title: "Media - EventBuzz",
  description: "Manage event photos and videos",
}

export default function MediaPage() {
  return <MediaTabs/>
}