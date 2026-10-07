import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqApiKey = process.env.CRON_JOB_API_KEY;
  const apiKey = req.headers.get("api-key");
  if (!reqApiKey || !apiKey || reqApiKey !== apiKey) {
    console.log("No/Wrong API key provided");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }
  console.log("Server activated successfully");
  return NextResponse.json(
    { message: "Server activated successfully" },
    { status: 200 }
  );
}