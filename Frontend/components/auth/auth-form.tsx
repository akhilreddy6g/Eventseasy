"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { onLogIn } from "@/lib/features/user-slice";
import { authLoginClientAction } from "./auth";
import { apiUrl } from "../constants";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const form = useForm();
  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (type === "signup") {
        formData.append("username", data.username);
      }
      const result = await authLoginClientAction(formData);
      const authenticated = result.success;
      if (authenticated && result.accessToken) {
        dispatch(onLogIn({ user: data.user, userName: result.userName }));
        apiUrl.defaults.headers.common["Authorization"] = result.accessToken
        const cookieResponse = await fetch("/api/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: result.accessToken, user: result.user })
        });
        if (!cookieResponse.ok) {
          console.error("Error setting cookie:", cookieResponse.statusText);
        }
        sessionStorage.setItem("authorization", result.accessToken)
        sessionStorage.setItem("user", data.email);
        sessionStorage.setItem("eventChange", JSON.stringify(0));
        sessionStorage.setItem("userName", result.userName);
        // Should be redirected to the dashboard. Temporarily redirecting to events
        console.log("Login successful, redirecting to events");
        router.push(`/events`);
      } else if (sessionStorage.getItem("authorization")) {
        apiUrl.defaults.headers.common["Authorization"] =sessionStorage.getItem("authorization");
      } else {
        console.error("Authentication failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {type === "signup" && (
            <div className="grid gap-2">
              <Label htmlFor="username">Name</Label>
              <Input
                id="username"
                type="text"
                disabled={isLoading}
                required
                {...form.register("username")}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
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
  );
}