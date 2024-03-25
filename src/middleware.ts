import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabaseClient = createMiddlewareClient({ req, res });

  const { data: session } = await supabaseClient.auth.getSession();

  // Redirect user to login if not authenticated
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  /**
   * Currently NOT working on SSR because Supabase redirects with hash-based email
   * verification links and hash is not accessible on server side which middleware is working on
   * so for now redirect handles in /api/auth/callback API route
   * Issue: https://github.com/supabase/gotrue-js/issues/455
   */

  //   const emailLinkError = "Email link is invalid or has expired";
  //   // Redirect user to sign-up if email link error (expired or invalid)
  //   if (
  //     req.nextUrl.searchParams.get("error_description") === emailLinkError &&
  //     req.nextUrl.pathname !== "/sign-up"
  //   ) {
  //     return NextResponse.redirect(
  //       new URL(
  //         `/sign-up?error_description=${req.nextUrl.searchParams.get(
  //           "error_description"
  //         )}`,
  //         req.url
  //       )
  //     );
  //   }

  if (["/login", "/sign-up"].includes(req.nextUrl.pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}
