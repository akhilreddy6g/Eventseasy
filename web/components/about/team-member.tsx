"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMemberProps {
  name: string
  role: string
  image: string
  bio: string
}

export function TeamMember({ name, role, image, bio }: TeamMemberProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-sm text-primary">{role}</p>
        <p className="text-muted-foreground">{bio}</p>
      </div>
    </div>
  )
}