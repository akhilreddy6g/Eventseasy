"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PriceCardProps {
  title: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}

export function PriceCard({ title, price, description, features, highlighted }: PriceCardProps) {
  return (
    <div className={`relative rounded-2xl border p-8 ${highlighted ? 'border-primary shadow-lg' : 'border-border'}`}>
      {highlighted && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
          Most Popular
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="space-y-2">
          <p className="text-3xl font-bold">{price}</p>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <ul className="space-y-2.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={highlighted ? "default" : "outline"}>
          Get Started
        </Button>
      </div>
    </div>
  )
}