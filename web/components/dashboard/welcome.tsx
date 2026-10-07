'use client';

import { useAppSelector } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Users, MessageSquare, UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function EventsEasyQuickOverview() {
  const features = [
    {
        icon: <Calendar className="h-6 w-6 text-primary" />,
        title: "Host, Attend & Manage Events",
        desc: "Easily create, schedule, attend and manage events for exceptional experiences."
    },
    {
        icon: <Users className="h-6 w-6 text-primary" />,
        title: "Real Time Invitation",
        desc: "Send real-time invitations to guests and managers for events to keep them up to date with everything about the event."
    },
    {
        icon: <MessageSquare className="h-6 w-6 text-primary" />,
        title: "Real Time Chat",
        desc: "Engage participants with multiple live chat rooms tied to each event and keep the conversations going."
    },
    {
        icon: < UploadIcon className="h-6 w-6 text-primary" />,
        title: "Upload Media",
        desc: "Upload and share media with all the event participants."
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {features.map((f, i) => (
        <Card key={i} className="shadow-md rounded-2xl">
          <CardHeader className="flex items-center space-x-3">
            {f.icon}
            <CardTitle className="text-base">{f.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


export default function Welcome() {
    const cacheUserName = useAppSelector((state) => state.userLoginSliceReducer.userName)
    const [userName, setUserName]   = useState<string>(cacheUserName);
    

    useEffect(() => {
        if (typeof window !== 'undefined') { 
            if (userName === "") {
                setUserName(sessionStorage.getItem("userName") || "")
            }
        }
      }, []);
    return (
        <div className="flex flex-col flex-1 items-center justify-center gap-8">
            <h1 className="text-3xl font-light"> Welcome <span className="font-bold">{userName}</span></h1>
            <EventsEasyQuickOverview></EventsEasyQuickOverview>
        </div>
    )
}