"use client";

import {
  Card,
  //CardContent,
  CardDescription,
  //   CardFooter,
  //   CardHeader,
  //   CardTitle,
} from "@/components/ui/card";
export default function ChatMessage(props: { message: string }) {
  return (
    <Card className="w-[350px]">
      <CardDescription>{props.message}</CardDescription>
    </Card>
  );
}
