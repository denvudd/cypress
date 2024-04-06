import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrRetrieveCustomer } from "@/lib/stripe/admin-tasks";
import { stripe } from "@/lib/stripe";
import { getURL } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { price, quantity = 1, metadata = {} } = await request.json();

  try {
    const supabaseClient = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const customer = await createOrRetrieveCustomer({
      email: user?.email ?? "",
      uuid: user?.id ?? "",
    });

    const session = await stripe.checkout.sessions.create({
      // @ts-expect-error - SessionCreateParams.PaymentMethodType type literally has "card" property
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer,
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        trial_from_plan: true,
      },
      success_url: `${getURL()}/dashboard`,
      cancel_url: `${getURL()}/dashboard`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.log("Stripe create-checkout-session error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
