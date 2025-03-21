"use client";

import {
  Card,
  CardDescription,
} from "@/components/ui/card";
export default function ChatMessage(props: { message: string }) {
  return (
    <Card className="w-[350px]">
      <CardDescription>{props.message}</CardDescription>
    </Card>
  );
}
