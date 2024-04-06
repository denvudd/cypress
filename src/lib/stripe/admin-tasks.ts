import Stripe from "stripe";
import { stripe } from ".";
import { Price, Product, Subscription } from "@/types/supabase.types";
import db from "../supabase/db";
import { customers, prices, products, users } from "../../../migrations/schema";
import { eq } from "drizzle-orm";
import { toDateTime } from "../utils";
import { subscriptions } from "../supabase/schema";

/** Create or update a Stripe product record
 * @param product - Stripe product
 */
export async function upsertProductRecord(product: Stripe.Product) {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  try {
    await db
      .insert(products)
      .values(productData)
      .onConflictDoUpdate({ target: products.id, set: productData });
  } catch (error) {
    throw new Error("Could not upsert product: " + product.id);
  }

  console.log("Product inserted: " + product.id);
}

/** Create or update a Stripe price record
 * @param price - Stripe price
 */
export async function upsertPriceRecord(price: Stripe.Price) {
  const priceData: Price = {
    id: price.id,
    productId: typeof price.product === "string" ? price.product : null,
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? null,
    type: price.type,
    unitAmount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    intervalCount: price.recurring?.interval_count ?? null,
    trialPeriodDays: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata,
  };

  try {
    await db
      .insert(prices)
      .values(priceData)
      .onConflictDoUpdate({ target: prices.id, set: priceData });
  } catch (error) {
    throw new Error("Could not upsert price: " + price.id);
  }
}

/** Create or retrieve a Stripe customer
 * @param email - customer email
 * @param uuid - customer uuid
 */
export async function createOrRetrieveCustomer({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) {
  try {
    const response = await db.query.customers.findFirst({
      where: (customer, { eq }) => eq(customer.id, uuid),
    });

    if (!response) {
      throw new Error("Could not find customer: " + uuid);
    }

    return response.stripeCustomerId;
  } catch (error) {
    const customerData: { metadata: { supabaseUUID: string }; email?: string } =
      { metadata: { supabaseUUID: uuid } };

    if (email) {
      customerData.email = email;
    }

    try {
      const customer = await stripe.customers.create(customerData);
      await db
        .insert(customers)
        .values({ id: uuid, stripeCustomerId: customer.id });

      console.log("Customer created: " + uuid);
      return customer.id;
    } catch (error) {
      throw new Error("Could not create customer: " + uuid);
    }
  }
}

/** Copy billing details to customer
 * @param userId - user (customer) id
 * @param paymentMethod - Stripe payment method
 */
export async function copyBillingDetailsToCustomer(
  userId: string,
  paymentMethod: Stripe.PaymentMethod
) {
  const customer = paymentMethod.customer as string;
  const { name, phone, address } = paymentMethod.billing_details;

  if (!name || !phone || !address) {
    return undefined;
  }

  // @ts-expect-error - Stripe typings are wrong somehow
  await stripe.customers.update(customer, { name, phone, address });

  try {
    await db
      .update(users)
      .set({
        billingAddress: { ...address },
        paymentMethod: { ...paymentMethod[paymentMethod.type] },
      })
      .where(eq(users.id, userId));
  } catch (error) {
    throw new Error("Could not copy billing details to customer: " + userId);
  }
}

/** Manage subscription status. Create or update a Stripe subscription
 * @param subscriptionId - Stripe subscription id
 * @param customerId - Stripe customer id
 * @param createAction - true if create action should be performed
 */
export async function manageSubscriptionStatusChange(
  subscriptionId: string,
  customerId: string,
  createAction: boolean = false
) {
  try {
    const customerData = await db.query.customers.findFirst({
      where: (customer, { eq }) => eq(customer.stripeCustomerId, customerId),
    });

    if (!customerData) {
      throw new Error("Could not find customer: " + customerId);
    }

    const { id: userId } = customerData;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method"],
    });

    const subscriptionData: Subscription = {
      id: subscription.id,
      userId: userId,
      metadata: subscription.metadata,
      // @ts-expect-error - "paused" value is missing, others are definetly exists
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      // @ts-expect-error - subscription.quantity is definetly exists
      quantity: subscription.quantity,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at
        ? toDateTime(subscription.cancel_at).toISOString()
        : null,
      canceledAt: subscription.canceled_at
        ? toDateTime(subscription.canceled_at).toISOString()
        : null,
      currentPeriodStart: toDateTime(
        subscription.current_period_start
      ).toISOString(),
      currentPeriodEnd: toDateTime(
        subscription.current_period_end
      ).toISOString(),
      endedAt: subscription.ended_at
        ? toDateTime(subscription.ended_at).toISOString()
        : null,
      trialStart: subscription.trial_start
        ? toDateTime(subscription.trial_start).toISOString()
        : null,
      trialEnd: subscription.trial_end
        ? toDateTime(subscription.trial_end).toISOString()
        : null,
    };

    await db
      .insert(subscriptions)
      .values(subscriptionData)
      .onConflictDoUpdate({ target: subscriptions.id, set: subscriptionData });

    if (createAction && subscription.default_payment_method && userId) {
      await copyBillingDetailsToCustomer(
        userId,
        subscription.default_payment_method as Stripe.PaymentMethod
      );
    }
  } catch (error) {
    throw new Error("Could not manage subscription status change: " + error);
  }
}
