import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { accessToken, user } = await req.json();

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Missing user email' }, { status: 400 });
  }


  const decoded = jwt.decode(accessToken) as { exp?: number };

  if (!decoded?.exp) {
    return NextResponse.json({ error: 'Invalid token or missing exp' }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = decoded.exp - now;

  if (secondsUntilExpiry <= 0) {
    return NextResponse.json({ error: 'Token already expired' }, { status: 400 });
  }

  const cookie = serialize('accessToken', JSON.stringify({ act: accessToken, user: user }), {
    path: '/',
    maxAge: secondsUntilExpiry,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: false, // so layout.tsx or cookies() can read it
    secure: process.env.NODE_ENV === 'production',
  });

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
