import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrRetrieveCustomer } from "@/lib/stripe/admin-tasks";
import { stripe } from "@/lib/stripe";
import { getURL } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const customer = await createOrRetrieveCustomer({
      email: user?.email ?? "",
      uuid: user?.id ?? "",
    });

    if (!customer) {
      throw new Error("No customer found");
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/dashboard`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.log(error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
