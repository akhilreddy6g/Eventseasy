import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  console.log("Server activated successfully");
  const res = NextResponse.json({ message: "Server activated successfully"});
  return res;
}