"use client"

import { 
  Calendar, Users, Bell, MessageSquare, 
  Map, Camera, Shield, Gauge, Zap 
} from "lucide-react"
import { FeatureCard } from "@/components/features/feature-card"
import { FeatureSection } from "@/components/features/feature-section"

export function FeaturesContent() {
  return (
    <div className="container">
      <div className="text-center py-20 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Powerful Features</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Everything you need to create, manage, and deliver exceptional events
        </p>
      </div>

      <FeatureSection 
        title="Event Management" 
        description="Comprehensive tools to plan and execute successful events"
      >
        <FeatureCard
          Icon={Calendar}
          title="Event Planning"
          description="Create and manage events with our intuitive planning tools and customizable templates"
        />
        <FeatureCard
          Icon={Users}
          title="Guest Management"
          description="Easily manage guest lists, RSVPs, and seating arrangements in one place"
        />
        <FeatureCard
          Icon={Bell}
          title="Real-time Updates"
          description="Keep everyone informed with instant notifications and event updates"
        />
      </FeatureSection>

      <FeatureSection 
        title="Communication" 
        description="Stay connected with your team and guests throughout the event"
      >
        <FeatureCard
          Icon={MessageSquare}
          title="Live Chat"
          description="Real-time communication between hosts, managers, and guests"
        />
        <FeatureCard
          Icon={Map}
          title="Location Services"
          description="Guide guests with integrated maps, landmarks, and directions"
        />
        <FeatureCard
          Icon={Camera}
          title="Media Sharing"
          description="Share and collect photos and videos from your events securely"
        />
      </FeatureSection>

      <FeatureSection 
        title="Platform Benefits" 
        description="Why EventBuzz is the perfect choice for your events"
      >
        <FeatureCard
          Icon={Shield}
          title="Security"
          description="Enterprise-grade security with role-based access control"
        />
        <FeatureCard
          Icon={Gauge}
          title="Performance"
          description="Lightning-fast platform optimized for seamless experience"
        />
        <FeatureCard
          Icon={Zap}
          title="Scalability"
          description="Handle events of any size with our scalable infrastructure"
        />
      </FeatureSection>
    </div>
  )
}