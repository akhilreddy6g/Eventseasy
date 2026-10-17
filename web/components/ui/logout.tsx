"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { apiUrl } from "../constants";

export default function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const apiRequest = await apiUrl.delete("/auth/logout");
    if (apiRequest.data?.success) {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("eventChange");
      sessionStorage.removeItem("authorization");
      router.push("/");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      className={`text-white font-semibold py-2 px-4 rounded cursor-pointer ${className}`}
    >
      Logout
    </Button>
  );
}
