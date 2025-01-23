'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Cookies from 'js-cookie'
import { apiUrl } from "@/components/noncomponents";

interface EventJoinee{
    accType: "manager" | "guest";
}

export default function JoinEvent({accType}: EventJoinee){
    const [eventCode, setEventCode] = useState("");
    const [error, setError] = useState("");
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (!eventCode.trim()) {
            setError("Event entry code is required.");
            return;
          }
          setError("");
          console.log("Event Code Submitted:", eventCode);
          const cookies = Cookies.get("accessToken");
          if (cookies) {
            const session = JSON.parse(cookies);
            const user = session.email;
            const body = {
                user: user,
                entryCode: eventCode,
                accType: accType,
            }
            const response = (await apiUrl.post(`/events/join`, body)).data
            if (response && response.success){
                console.log("entry to the event granted")
            } else {
                console.log("Incorrect credentials provided")
            return
            }
          } else {
            console.log("session logged out")
          }
      } catch (error) {
        console.log("error submitting the form: ", error)
      }
    };
    return (
        <div className="flex justify-center h-2/4">
          <form
            onSubmit={handleSubmit}
            className={cn(
              "w-full max-w-xl p-6 shadow-lg border border-gray-200 rounded-lg bg-white space-y-6"
            )}
          >
            <h1 className="text-xl font-bold text-center text-primary">
              {accType=="manager"? "Manage an Event" : "Attend an Event"}
            </h1>
            <div className="space-y-3">
              <Label htmlFor="event-code" className="text-sm font-medium">
                Entry Code
              </Label>
              <Input
                id="event-code"
                type="text"
                placeholder="Enter the Entry Code"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                className="w-full"
              />
              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!eventCode}
            >
              Submit
            </Button>
          </form>
        </div>
      );
}
