import { Metadata } from "next"
import { PriceCard } from "@/components/pricing/price-card"

export const metadata: Metadata = {
  title: "Pricing - Eventseasy",
  description: "Simple, transparent pricing for events of all sizes",
}

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your event management needs
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <PriceCard
          title="Basic"
          price="$29/month"
          description="Perfect for small events and gatherings"
          features={[
            "Up to 100 guests",
            "Basic event analytics",
            "Email support",
            "1 event manager",
            "Basic customization"
          ]}
        />
        <PriceCard
          title="Pro"
          price="$79/month"
          description="Ideal for medium-sized events"
          features={[
            "Up to 500 guests",
            "Advanced analytics",
            "Priority support",
            "5 event managers",
            "Custom branding",
            "Guest messaging"
          ]}
          highlighted
        />
        <PriceCard
          title="Enterprise"
          price="$199/month"
          description="For large-scale events and organizations"
          features={[
            "Unlimited guests",
            "Custom analytics",
            "24/7 phone support",
            "Unlimited managers",
            "White-label solution",
            "API access",
            "Custom integrations"
          ]}
        />
      </div>
    </div>
  )
}