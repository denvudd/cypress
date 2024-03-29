import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const requestURL = new URL(req.url);
  const code = requestURL.searchParams.get("code");
  const errorDescription = requestURL.searchParams.get("error_description");

  if (code) {
    const supabaseClient = createRouteHandlerClient({ cookies });

    await supabaseClient.auth.exchangeCodeForSession(code);
  }

  if (errorDescription === "Email link is invalid or has expired") {
    return NextResponse.redirect(`${requestURL.origin}/email-expired`);
  }

  return NextResponse.redirect(`${requestURL.origin}/dashboard`);
}
