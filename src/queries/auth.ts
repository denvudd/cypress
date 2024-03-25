"use server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { LoginValidatorSchema } from "@/lib/validators/login.validator";
import { cookies } from "next/headers";

export async function loginUser({
  email,
  password,
}: LoginValidatorSchema) {
  const supabaseClient = createRouteHandlerClient({ cookies });

  const response = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  return response;
}
