"use server";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { LoginValidatorSchema } from "@/lib/validators/login.validator";
import { cookies } from "next/headers";
import { SignUpValidatorSchema } from "@/lib/validators/sign-up.validator";
import { users } from "../../migrations/schema";
import { eq, ilike } from "drizzle-orm";
import db from "@/lib/supabase/db";
import { User } from "@/types/supabase.types";

/** Login user with credentials */
export async function loginUser({ email, password }: LoginValidatorSchema) {
  console.log("WORKS WORKS")
  const supabaseClient = createRouteHandlerClient({ cookies });

  const response = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (response.error) {
    return {
      data: {user: null, session: null},
      error: response.error.message
    }
  }

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

/** Update user information */
export async function updateUser(
  newUser: Partial<User>,
  userId: string
) {
  if (!userId) return undefined;

  console.log("NEW USER", newUser)

  try {
    await db
      .update(users)
      .set(newUser)
      .where(eq(users.id, userId));

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: `Error ${error}`,
    };
  }
}
