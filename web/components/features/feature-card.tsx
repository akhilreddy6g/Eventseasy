"use client"

import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  Icon: LucideIcon
}

export function FeatureCard({ title, description, Icon }: FeatureCardProps) {
  return (
    <div className="group relative rounded-lg border p-6 hover:shadow-md transition-all">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}