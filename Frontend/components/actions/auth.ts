"use server";

import { cookies } from "next/headers";
import { serverApi } from "../constants";

export async function authLoginServerAction(formData: FormData) {
  const user = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string | undefined;

  const data = { user, password, username };
  const route = username ? "/auth/signup" : "/auth/signin";

  try {
    const res = await serverApi.post(route, data);
    let accessToken
    const setCookies = res.headers["set-cookie"] || [];
    const accessTokenRaw = setCookies.find((c: string) =>
        c.startsWith("accessToken=")
      );
      if (accessTokenRaw) {
        const [cookieStr, ...attrs] = accessTokenRaw.split("; ");
        const [name, value] = cookieStr.split("=");
        const options: Record<string, any> = {};
        for (const attr of attrs) {
          const [key, val] = attr.split("=");
          const k = key.toLowerCase();
          if (k === "secure") options.secure = true;
          else if (k === "httponly") options.httpOnly = true;
          else if (k === "samesite") options.sameSite = val;
          else if (k === "max-age") options.maxAge = parseInt(val, 10);
          else if (k === "path") options.path = val;
          else if (k === "expires") options.expires = new Date(val);
        }
        cookies().set(name, decodeURIComponent(value), options);
        const parsedAccessToken = JSON.parse(decodeURIComponent(value))?.act;
        return {success: res.data.success, user: res.data.user, userName: res.data.userName, accessToken: parsedAccessToken};
      }
      return { success: false, error: "No accessToken found" };
    }catch (err) {
    console.error("Server action error:", err);
    return { success: false };
  }
}
