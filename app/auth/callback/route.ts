import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Get origin more robustly for production
  const getOrigin = () => {
    // First try environment variable
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }

    // Auto-detect production URLs
    if (
      requestUrl.origin.includes("vercel.app") ||
      requestUrl.origin.includes("cifrafinance")
    ) {
      return requestUrl.origin;
    }

    // Default to request origin
    return requestUrl.origin;
  };

  const origin = getOrigin();

  console.log("OAuth Callback Debug:", {
    code: code ? "present" : "missing",
    requestUrl: requestUrl.toString(),
    origin,
    headers: Object.fromEntries(request.headers.entries()),
  });

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth-error?error=${encodeURIComponent(
          error.message
        )}`
      );
    }

    // After successful authentication, redirect to home page
    // where logic will handle showing setup or dashboard
    return NextResponse.redirect(`${origin}/?auth=success`);
  }

  // If no code, redirect to home page
  return NextResponse.redirect(`${origin}/`);
}
