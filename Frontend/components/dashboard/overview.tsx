"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react"

const stats = [
  {
    name: "Total Events",
    value: "12",
    icon: Calendar,
    change: "+2 this month",
  },
  {
    name: "Total Guests",
    value: "1,234",
    icon: Users,
    change: "+180 this month",
  },
  {
    name: "Revenue",
    value: "$12,345",
    icon: DollarSign,
    change: "+15% from last month",
  },
  {
    name: "Growth",
    value: "24%",
    icon: TrendingUp,
    change: "+5% from last month",
  },
]

export function DashboardOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.name}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}