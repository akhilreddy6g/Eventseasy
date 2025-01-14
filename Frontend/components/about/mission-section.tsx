import { ReactNode } from "react"

interface MissionSectionProps {
  title: string
  children: ReactNode
}

export function MissionSection({ title, children }: MissionSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="text-muted-foreground space-y-4">
        {children}
      </div>
    </div>
  )
}