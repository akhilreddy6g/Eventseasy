"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useRouter} from 'next/navigation';
import { NextRequest } from 'next/server';
import { apiUrl } from "../noncomponents"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "login" | "signup"
}

export function AuthForm({ type, className, ...props }: AuthFormProps, req: NextRequest) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const form = useForm()
  const router = useRouter();
  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      const response = await apiUrl.post("/auth/signin", {email: data.email, password: data.password})
      if (response.data.Authenticated) {
        router.push(`/dashboard`);
      } else {
        console.log("Authentication failed");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="grid gap-6" {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
              {...form.register("email")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              required
              {...form.register("password")}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {type === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </div>
      </form>
    </div>
  )
}