import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader></SiteHeader>
      <main className="flex-col w-screen items-center">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Events, Simplified
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Seamlessly manage events, collaborate with teams, and create memorable experiences with Eventseasy.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button size="lg" className="px-8">Get Started</Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" size="lg" className="px-8">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-4">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Event Planning</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Create and manage events with ease using our intuitive tools.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Team Collaboration</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Work seamlessly with your team to coordinate every detail.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Clock className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Real-time Updates</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Keep everyone informed with instant notifications and updates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <MapPin className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Location Services</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Guide guests with integrated maps and directions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}