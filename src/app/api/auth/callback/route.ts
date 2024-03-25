import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const requestURL = new URL(req.url);
  const code = requestURL.searchParams.get("code");

  if (code) {
    const supabaseClient = createRouteHandlerClient({ cookies });

    await supabaseClient.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${requestURL.origin}/dashboard`);
}
