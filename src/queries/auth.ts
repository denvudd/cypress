"use server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { LoginValidatorSchema } from "@/lib/validators/login.validator";
import { cookies } from "next/headers";
import { SignUpValidatorSchema } from "@/lib/validators/sign-up.validator";

export async function loginUser({ email, password }: LoginValidatorSchema) {
  const supabaseClient = createRouteHandlerClient({ cookies });

  const response = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  return response;
}

export async function signUpUser({ email, password }: SignUpValidatorSchema) {
  const supabaseClient = createRouteHandlerClient({ cookies });

  const { data } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("email", email);

  if (data?.length) {
    return {
      error: {
        message: "User already exists",
        data,
      },
    };
  }

  const response = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`,
    },
  });

  return response;
}
