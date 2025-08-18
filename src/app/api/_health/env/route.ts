import { NextResponse } from "next/server";
export async function GET() {
  const checks = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GITHUB_ID: !!process.env.GITHUB_ID,
    GITHUB_SECRET: !!process.env.GITHUB_SECRET,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
  };
  return NextResponse.json({
    ok: Object.values(checks).every(Boolean),
    checks,
  });
}
