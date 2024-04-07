"use server";

import db from "@/lib/supabase/db";

export async function getProductsWithPrice() {
  try {
    const response = await db.query.products.findMany({
      where: (product, { eq }) => eq(product.active, true),
      with: {
        prices: {
          where: (price, { eq }) => eq(price.active, true),
        },
      },
    });

    if (response.length) {
      return { data: response, error: null };
    }

    return {
      data: [],
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      data: [],
      error,
    };
  }
}
