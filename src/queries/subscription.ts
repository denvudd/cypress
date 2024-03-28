"use server";

import db from "@/lib/supabase/db";
import { Subscription } from "@/types/supabase.types";

/** Get subscription by user id */
export async function getUserSubscriptionStatus(userId: string) {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (subscription, { eq }) => eq(subscription.userId, userId),
    });

    if (!data) {
      return {
        data: null,
        error: null,
      };
    }

    return { data: data as Subscription, error: null };
  } catch (error) {
    return {
      data: null,
      error: `Error ${error}`,
    };
  }
}
