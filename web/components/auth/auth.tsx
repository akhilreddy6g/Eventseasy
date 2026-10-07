"use client";

import { apiUrl } from "../constants";

export async function authLoginClientAction(formData: FormData) {
  const user = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string | undefined;

  const data = { user, password, username };
  const route = username ? "/auth/signup" : "/auth/signin";

  try {
    const response = (await apiUrl.post(route, data)).data;
    if (response.accessToken.length > 0) {
      return response;
    }
    return { success: false, error: "No accessToken found" };
  } catch (err) {
    console.error("Client-side login error:", err);
    return { success: false };
  }
}

