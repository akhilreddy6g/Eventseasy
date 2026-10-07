"use client"

import { ReactNode } from "react"

interface FeatureSectionProps {
  title: string
  description: string
  children: ReactNode
}

export function FeatureSection({ title, description, children }: FeatureSectionProps) {
  return (
    <section className="py-16">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </section>
  )
}