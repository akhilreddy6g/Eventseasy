'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { apiUrl } from '../noncomponents';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await apiUrl.delete("/auth/logout")
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("userName")
    sessionStorage.removeItem("eventChange")
    sessionStorage.removeItem("authorization")
    router.push("/");
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-0 px-4 rounded cursor-pointer"
    >
      Logout
    </Button>
  );
}
