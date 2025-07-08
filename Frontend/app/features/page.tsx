import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features - Eventseasy",
  description: "Discover all the powerful features that make Eventseasy the perfect platform for your events",
}

import { FeaturesContent } from "./features-content"

export default function FeaturesPage() {
  return (<div className="flex justify-center"><FeaturesContent /></div>)
}