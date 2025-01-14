import { Metadata } from "next"
import { TeamMember } from "@/components/about/team-member"
import { MissionSection } from "@/components/about/mission-section"

export const metadata: Metadata = {
  title: "About - EventBuzz",
  description: "Learn about EventBuzz's mission and the team behind the platform",
}

export default function AboutPage() {
  return (
    <div className="flex justify-center items-center">
      <div className="max-w-3xl mx-auto py-20 space-y-16">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">About EventBuzz</h1>
          <p className="text-xl text-muted-foreground">
            Transforming event management through innovation and collaboration
          </p>
        </div>

        <MissionSection title="Mission">
          <p>
            At EventBuzz, we believe that every event has the potential to create lasting memories. 
            Our mission is to empower event organizers with innovative tools that simplify planning, 
            enhance collaboration, and create exceptional experiences.
          </p>
          <p>
            We're dedicated to transforming the way events are managed by combining cutting-edge 
            technology with intuitive design, making event planning accessible to everyone.
          </p>
        </MissionSection>

        <MissionSection title="Vision">
          <p>
            We envision a world where creating and managing events is seamless and stress-free. 
            By providing a comprehensive platform that handles everything from guest management 
            to real-time communications, we're making this vision a reality.
          </p>
        </MissionSection>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-center">Meet the Team</h2>
          <div className="grid md:grid-cols-1 gap-8">
            <TeamMember
              name="Akhil Reddy"
              role="Developer"
              image="images/profilepic.jpg"
              bio="Full Stack Intern at The Commons XR and Graduate at University of Florida"
            />
          </div>
        </div>
      </div>
    </div>
  )
}