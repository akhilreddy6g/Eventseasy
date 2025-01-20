import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")
  if (!accessToken) {
    console.log("No Authorization header found, redirecting...");
    const redirectUrl = new URL('/', req.url); 
    return NextResponse.redirect(redirectUrl);
  } else {
    console.log("Token found, continuing...");
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/events'],
};
