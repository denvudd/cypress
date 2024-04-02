"use server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { LoginValidatorSchema } from "@/lib/validators/login.validator";
import { cookies } from "next/headers";
import { SignUpValidatorSchema } from "@/lib/validators/sign-up.validator";
import { users } from "../../migrations/schema";
import { ilike } from "drizzle-orm";
import db from "@/lib/supabase/db";

/** Login user with credentials */
export async function loginUser({ email, password }: LoginValidatorSchema) {
  const supabaseClient = createRouteHandlerClient({ cookies });

  const response = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  return response;
}

/** Sign up user with credentials and email varifacation */
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

/** Get authenticated user */
export async function getAuthUser(userId: string) {
  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  return response
}

/** Search users from their email */
export async function searchUser(email: string) {
  if (!email) return [];

  const accounts = db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`));

  return accounts;
}
