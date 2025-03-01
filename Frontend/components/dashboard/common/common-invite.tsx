"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/components/noncomponents";
import { useAppSelector } from "@/lib/store";
import { useDispatch} from "react-redux";
import { AppDispatch } from "@/lib/store"
import { onNewGuestInvite } from "@/lib/features/guest-slice";
import { onNewManagerInvite } from "@/lib/features/manager-slice";

interface InviteType{
    accType: "Manage" | "Attend";
    eventId: string;
}

export default function InviteUser({accType, eventId}: InviteType) {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const user = accType=="Attend"? "Guest": "Manager"
  const appState = useAppSelector((state)=> state.initialSliceReducer)
  const userEmail = sessionStorage.getItem("user");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput(email)) {
        setError("Please enter a valid email");
        return;
    } if (!username.trim()) {
        setError("Username cannot be empty.");
        return;
    }
    if(userEmail!=email){
      const body = {username: username, user: email, hostName: sessionStorage.getItem("userName") ?? "someone who you might know", eventId: eventId, eventName:appState?.userData?.filter((curr)=> curr?.eventId===eventId)?.[0]?.eventData?.[0]?.event, accType: accType, access: false, message: message, flag: false}
      const response = await apiUrl.post(`/invite/send`, body)
      if(response && response.data.success){
          alert(`Invitation sent to the ${user}!`);
          accType=="Attend" ? dispatch(onNewGuestInvite()) : dispatch(onNewManagerInvite())
      } else {
          alert(`Unable to send an invite to the ${user}`)
      }
      setError("");
      setEmail("");
      setUsername("");
      setMessage("");
      setFile(null);
    } else {
      setError(`${user} email must not be the same as yours`);
      console.error(`${user} email must not be the same as yours`)
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const validateInput = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-lg border"
      )}
    >
    {/* Username */}
      <div className="mb-4">
        <Label htmlFor="username" className="block mb-2 text-sm font-medium">
            {user + " Name"} <span className="text-red-600">*</span>
        </Label>
        <Input
            id="username"
            type="text"
            placeholder={`Enter the ${user} Name`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={cn(
            "w-full p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
            error && !username.trim() ? "border-red-500" : "border-gray-300"
            )}
        />
        {error && !username.trim() && (
            <p className="mt-1 text-sm text-red-500">Username cannot be empty.</p>
        )}
      </div>
      
    {/* Email */}
      <div className="mb-4">
        <Label htmlFor="email-phone" className="block mb-2 text-sm font-medium">
          Email <span className="text-red-600">*</span>
        </Label>
        <Input
          id="email-phone"
          type="text"
          placeholder={`Enter the ${user} Email`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "w-full p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
            error && !validateInput(email) ? "border-red-500" : "border-gray-300"
          )}
        />
        {error && !validateInput(email) && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>

    {/* Message */}
      <div className="mb-4">
        <Label htmlFor="message" className="block mb-2 text-sm font-medium">
          Message (Optional)
        </Label>
        <Textarea
          id="message"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(
            "w-full p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
            "border-gray-300"
          )}
        />
      </div>

    {/* Photo/Video Upload */}
      <div className="mb-4">
        <Label htmlFor="file-upload" className="block mb-2 text-sm font-medium">
          Upload Inivtation (Optional)
        </Label>
        <Input
          id="file-upload"
          type="file"
          accept="application/pdf, image/*, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document, video/mp4"
          onChange={handleFileChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md "
        />
        {file && (
          <p className="mt-1 text-sm text-gray-600">
            Selected file: {file.name}
          </p>
        )}
      </div>

    {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!email || !username}
      >
        Submit
      </Button>
    </form>
  );
}
