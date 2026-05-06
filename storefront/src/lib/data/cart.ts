'use server';

import { HttpTypes } from '@medusajs/types';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import medusaError from '@/lib/helpers/medusa-error';
import { parseVariantIdsFromError } from '@/lib/helpers/parse-variant-error';
import { getCountryFromLocale } from '@/lib/helpers/locale-mapping';

import { fetchQuery, sdk } from '../config';
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId
} from './cookies';
import { getRegion } from './regions';

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId());

  if (!id) {
    return null;
  }

  const headers = {
    ...(await getAuthHeaders())
  };

  return await sdk.client
    .fetch<any>(`/store/carts/${id}`, {
      method: 'GET',
      query: {
        fields:
          '*items,*region,*shipping_address,*billing_address,*payment_collection, *items.product, *items.variant, *items.variant.options, items.variant.options.option.title,' +
          '*items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name' +
          ''
      },
      headers,
      cache: 'no-cache'
    })
    .then((resp: any) => resp.cart)
    .catch(async (error) => {
      // If cart not found (404) or already completed, remove the invalid cart ID from cookies
      if (
        error?.response?.status === 404 || 
        error?.message?.includes('not found') ||
        error?.message?.includes('already completed')
      ) {
        await removeCartId();
      }
      return null;
    });

}

export async function getOrSetCart(countryCode: string) {
  console.log("getOrSetCart called with countryCode:", countryCode);

  const region = await getRegion(countryCode);

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`);
  }

  let cart = await retrieveCart();

  const headers = {
    ...(await getAuthHeaders())
  };

  if (!cart) {
    const { cart: newCart } = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    );
    cart = newCart;

    await setCartId(cart.id);

    const cartCacheTag = await getCacheTag('carts');
    revalidateTag(cartCacheTag);
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { 
      region_id: region.id,
      currency_code: region.currency_code 
    }, {}, headers);
    const cartCacheTag = await getCacheTag('carts');
    revalidateTag(cartCacheTag);
  }

  return cart;
}

export async function updateCart(data: any) {
  const cartId = await getCartId();

  if (!cartId) {
    throw new Error('No existing cart found, please create one before updating');
  }

  const headers = {
    ...(await getAuthHeaders())
  };

  return await sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag('carts');
      await revalidateTag(cartCacheTag);
      return cart;
    })
    .catch(medusaError);
}

export async function addToCart({
  variantId,
  quantity,
  countryCode
}: {
  variantId: string;
  quantity: number;
  countryCode: string;
}) {
  console.log("addToCart called with:", { variantId, quantity, countryCode });

  if (!variantId) {
    throw new Error('Missing variant ID when adding to cart');
  }

  // Convert locale to country code if needed
  const actualCountryCode = getCountryFromLocale(countryCode);
  
  const cart = await getOrSetCart(actualCountryCode);

  if (!cart) {
    throw new Error('Error retrieving or creating cart');
  }

  const headers = {
    ...(await getAuthHeaders())
  };

  try {
    if (currentItem) {
      await sdk.store.cart
        .updateLineItem(
          cart.id,
          currentItem.id,
          { quantity: currentItem.quantity + quantity },
          {},
          headers
        );
    } else {
      await sdk.store.cart
        .createLineItem(
          cart.id,
          {
            variant_id: variantId,
            quantity
          },
          {},
          headers
        );
    }
  } catch (error: any) {
    if (error?.message?.includes('already completed')) {
      console.log("[addToCart] Cart already completed, retrying with fresh cart...");
      await removeCartId();
      const freshCart = await getOrSetCart(actualCountryCode);
      await sdk.store.cart.createLineItem(
        freshCart.id,
        { variant_id: variantId, quantity },
        {},
        await getAuthHeaders()
      );
    } else {
      return medusaError(error);
    }
  } finally {
    const cartCacheTag = await getCacheTag('carts');
    revalidateTag(cartCacheTag);
  }

}

export async function updateLineItem({ lineId, quantity }: { lineId: string; quantity: number }) {
  if (!lineId) {
    throw new Error('Missing lineItem ID when updating line item');
  }

  const cartId = await getCartId();

  if (!cartId) {
    throw new Error('Missing cart ID when updating line item');
  }

  const headers = {
    ...(await getAuthHeaders())
  };

  try {
    const res = await sdk.store.cart.updateLineItem(
      cartId,
      lineId,
      { quantity },
      {},
      headers
    );

    const cartCacheTag = await getCacheTag('carts');
    revalidateTag(cartCacheTag);

    return res;
  } catch (error) {
    return medusaError(error);
  }
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error('Missing lineItem ID when deleting line item');
  }

  const cartId = await getCartId();

  if (!cartId) {
    // Try to retrieve cart first
    const cart = await retrieveCart();
    if (!cart) {
      console.error('No cart found when deleting line item');
      return; // Silent fail instead of throwing
    }
    // Use the retrieved cart ID
    const headers = {
      ...(await getAuthHeaders())
    };

    await sdk.store.cart
      .deleteLineItem(cart.id, lineId, {}, headers)
      .then(async () => {
        const cartCacheTag = await getCacheTag('carts');
        revalidateTag(cartCacheTag);
      })
      .catch(medusaError);
    return;
  }

  const headers = {
    ...(await getAuthHeaders())
  };

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag('carts');
      revalidateTag(cartCacheTag);
    })
    .catch(medusaError);
}

export async function setShippingMethod({
  cartId,
  shippingMethodId
}: {
  cartId: string;
  shippingMethodId: string;
}) {
  const headers = {
    ...(await getAuthHeaders())
  };

  const res = await fetchQuery(`/store/carts/${cartId}/shipping-methods`, {
    body: { option_id: shippingMethodId },
    method: 'POST',
    headers
  });

  const cartCacheTag = await getCacheTag('carts');
  revalidateTag(cartCacheTag);

  return res;
}

export async function initiatePaymentSession(
  cart: any,
  data: {
    provider_id: string;
    context?: Record<string, unknown>;
  }
) {
  const headers = {
    ...(await getAuthHeaders())
  };

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async resp => {
      const cartCacheTag = await getCacheTag('carts');
      revalidateTag(cartCacheTag);
      return resp;
    })
    .catch(medusaError);
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId();

  if (!cartId) {
    return { success: false, error: "No existing cart found" }
  }

  const headers = {
    ...(await getAuthHeaders())
  };

  try {
    const { cart } = await sdk.store.cart.update(
      cartId,
      { promo_codes: codes },
      {},
      headers
    )
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    // @ts-ignore
    const applied = cart.promotions?.some((promotion: any) =>
      codes.includes(promotion.code)
    )
    return { success: true, applied }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to apply promotion code"
    return { success: false, error: errorMessage }
  }
}

export async function removeShippingMethod(shippingMethodId: string) {
  const cartId = await getCartId();

  if (!cartId) {
    throw new Error('No existing cart found');
  }

  const headers = {
    ...(await getAuthHeaders()),
    'Content-Type': 'application/json',
    'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string
  };

  return fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/carts/${cartId}/shipping-methods`, {
    method: 'DELETE',
    body: JSON.stringify({ shipping_method_ids: [shippingMethodId] }),
    headers
  })
    .then(async () => {
      const cartCacheTag = await getCacheTag('carts');
      revalidateTag(cartCacheTag);
    })
    .catch(medusaError);
}

export async function deletePromotionCode(promoId: string) {
  const cartId = await getCartId();

  if (!cartId) {
    throw new Error('No existing cart found');
  }
  const headers = {
    ...(await getAuthHeaders()),
    'Content-Type': 'application/json',
    'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string
  };

  return fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/carts/${cartId}/promotions`, {
    method: 'DELETE',
    body: JSON.stringify({ promo_codes: [promoId] }),
    headers
  })
    .then(async () => {
      const cartCacheTag = await getCacheTag('carts');
      revalidateTag(cartCacheTag);
    })
    .catch(medusaError);
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error('No form data found when setting addresses');
    }
    const cartId = await getCartId();
    if (!cartId) {
      throw new Error('No existing cart found when setting addresses');
    }

    const data = {
      shipping_address: {
        first_name: formData.get('shipping_address.first_name'),
        last_name: formData.get('shipping_address.last_name'),
        address_1: formData.get('shipping_address.address_1'),
        address_2: '',
        company: formData.get('shipping_address.company'),
        postal_code: formData.get('shipping_address.postal_code'),
        city: formData.get('shipping_address.city'),
        country_code: formData.get('shipping_address.country_code'),
        province: formData.get('shipping_address.province'),
        phone: formData.get('shipping_address.phone')
      },
      email: formData.get('email')
    } as any;

    // const sameAsBilling = formData.get("same_as_billing")
    // if (sameAsBilling === "on") data.billing_address = data.shipping_address
    data.billing_address = data.shipping_address;

    // if (sameAsBilling !== "on")
    //   data.billing_address = {
    //     first_name: formData.get("billing_address.first_name"),
    //     last_name: formData.get("billing_address.last_name"),
    //     address_1: formData.get("billing_address.address_1"),
    //     address_2: "",
    //     company: formData.get("billing_address.company"),
    //     postal_code: formData.get("billing_address.postal_code"),
    //     city: formData.get("billing_address.city"),
    //     country_code: formData.get("billing_address.country_code"),
    //     province: formData.get("billing_address.province"),
    //     phone: formData.get("billing_address.phone"),
    //   }

    await updateCart(data);
    await revalidatePath('/cart');
  } catch (e: any) {
    return e.message;
  }
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId());

  if (!id) {
    return { ok: false, error: 'No cart found. Please add items to your cart.' };
  }

  try {
    const headers = {
      ...(await getAuthHeaders())
    };

    console.log('[placeOrder] === START ===');
    console.log('[placeOrder] cartId:', id);
    console.log('[placeOrder] authHeaders:', headers);

    console.log('[placeOrder] Checking cart status...');

    // Fetch fresh cart using our reliable retrieveCart function
    const cart = await retrieveCart(id);
    
    console.log('[placeOrder] Cart retrieved:', cart?.id);
    const paymentCollection = cart?.payment_collection;
    const paymentSessions = paymentCollection?.payment_sessions;
    const shippingMethods = cart?.shipping_methods;
    const shippingAddress = cart?.shipping_address;

    console.log('[placeOrder] paymentCollection:', paymentCollection);
    console.log('[placeOrder] paymentSessions:', paymentSessions);
    console.log('[placeOrder] shippingMethods:', shippingMethods);
    console.log('[placeOrder] shippingAddress:', shippingAddress);

    // Check if shipping address exists after update
    if (!shippingAddress || !shippingAddress.address_1) {
      console.log('[placeOrder] Shipping address still missing after update!');
      return { ok: false, error: 'Failed to set shipping address. Please add one manually.' };
    }

    // Check if shipping method exists - if missing, add it

    // If shipping method is missing, try to re-add it from cart's data
    if (!shippingMethods || shippingMethods.length === 0) {
      console.log('[placeOrder] No shipping method, attempting to add from cart...');
      
      // Get available shipping options for this cart
      const optionsRes = await fetchQuery(`/store/shipping-options`, {
        method: 'GET',
        headers,
        query: { cart_id: id }
      });
      
      const shippingOptions = optionsRes?.data?.shipping_options;
      console.log('[placeOrder] Available shipping options:', shippingOptions);
      
      if (shippingOptions && shippingOptions.length > 0) {
        // Use the first available shipping option
        const firstOption = shippingOptions[0];
        console.log('[placeOrder] Adding shipping method with option:', firstOption.id);
        
        try {
          await sdk.store.cart.addShippingMethod(
            id,
            { option_id: firstOption.id },
            {},
            headers
          );
          console.log('[placeOrder] Shipping method added successfully');
          
          // Re-fetch cart to confirm shipping method is set
          const updatedCartRes = await fetchQuery(`/store/carts/${id}`, {
            method: 'GET',
            headers
          });
          const updatedCart = updatedCartRes?.data;
          console.log('[placeOrder] Updated cart shipping methods:', updatedCart?.shipping_methods);
          
          if (!updatedCart?.shipping_methods?.length) {
            return { ok: false, error: 'Failed to set shipping method. Please try selecting one from the delivery step.' };
          }
        } catch (shipErr: any) {
          console.log('[placeOrder] Failed to add shipping method:', shipErr?.message);
          return { ok: false, error: 'Please select a shipping method before completing your order.' };
        }
      } else {
        console.log('[placeOrder] No shipping options available!');
        return { ok: false, error: 'No shipping options available for your address. Please check your address and try again.' };
      }
    }

    // If no payment session exists, create one with manual payment (cash on delivery)
    if (!paymentSessions || paymentSessions.length === 0) {
      console.log('[placeOrder] No payment session, creating one...');
      
      // Try cash-on-delivery first, then system default
      const providerIds = [
        'pp_cash-on-delivery_cash-on-delivery',
        'pp_system_default'
      ];
      
      for (const providerId of providerIds) {
        try {
          console.log('[placeOrder] Trying provider:', providerId);
          await sdk.store.payment.initiatePaymentSession(
            { id, type: 'cart' },
            { provider_id: providerId },
            {},
            headers
          );
          console.log('[placeOrder] Payment session created with:', providerId);
          break;
        } catch (payErr: any) {
          console.log('[placeOrder] Provider', providerId, 'failed:', payErr?.message);
        }
      }
    }

    const res = await fetchQuery(`/store/carts/${id}/complete`, {
      method: 'POST',
      headers
    });

    console.log('[placeOrder] Complete response status:', res?.status);
    console.log('[placeOrder] Complete response:', res);

    if (!res.ok) {
      console.error('[placeOrder] Error response:', res?.error);
      return { ok: false, error: res?.error?.message || res?.error || 'Failed to complete order' };
    }

    const cartCacheTag = await getCacheTag('carts');
    revalidateTag(cartCacheTag);

    const orderSet = res?.data?.order_set;
    const order = orderSet?.orders?.[0];

    console.log('[placeOrder] orderSet:', orderSet);
    console.log('[placeOrder] order:', order);

    if (order) {
      revalidatePath('/user/reviews');
      revalidatePath('/user/orders');
      removeCartId();
      console.log('[placeOrder] === END: SUCCESS ===');
      
      return {
        ok: true,
        orderId: order.id
      };
    }

    console.log('[placeOrder] === END: NO ORDER ===');
    return { ok: false, error: 'Order was not created. Please try again.' };
  } catch (error: any) {
    console.error('[placeOrder] Exception:', error);
    console.log('[placeOrder] === END: EXCEPTION ===');
    return { ok: false, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId();
  
  // Convert locale to country code if needed
  const actualCountryCode = getCountryFromLocale(countryCode);
  const region = await getRegion(actualCountryCode);

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`);
  }

  if (cartId) {
    await updateCart({ region_id: region.id });
    const cartCacheTag = await getCacheTag('carts');
    revalidateTag(cartCacheTag);
  }

  const regionCacheTag = await getCacheTag('regions');
  revalidateTag(regionCacheTag);

  const productsCacheTag = await getCacheTag('products');
  revalidateTag(productsCacheTag);

  redirect(`/${countryCode}${currentPath}`);
}

/**
 * Updates the region and returns removed items for notification
 * This is a wrapper around updateRegion that doesn't redirect
 * Uses error-driven approach: tries to update, catches price errors, removes problem items, retries
 * @param countryCode - The country code to update to
 * @param currentPath - The current path for redirect
 * @returns Array of removed item names and new path
 */
export async function updateRegionWithValidation(
  countryCode: string,
  currentPath: string
): Promise<{ removedItems: string[]; newPath: string }> {
  const cartId = await getCartId();
  
  // Convert locale to country code if needed
  const actualCountryCode = getCountryFromLocale(countryCode);
  const region = await getRegion(actualCountryCode);

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`);
  }

  let removedItems: string[] = [];

  if (cartId) {
    const headers = {
      ...(await getAuthHeaders())
    };

    try {
      await updateCart({ region_id: region.id });
    } catch (error: any) {
      // Check if error is about variants not having prices
      if (!error?.message?.includes('do not have a price')) {
        // Re-throw if it's a different error
        throw error;
      }

      // Parse variant IDs from error message
      const problematicVariantIds = parseVariantIdsFromError(error.message);

      // Early return if no variant IDs found
      if (!problematicVariantIds.length) {
        throw new Error('Failed to parse variant IDs from error');
      }

      // Fetch cart with minimal fields to get items
      try {
        const resp = await sdk.client.fetch<any>(
          `/store/carts/${cartId}`,
          {
            method: 'GET',
            query: {
              fields: '*items'
            },
            headers,
            cache: 'no-cache'
          }
        );
        const cart = resp.cart;

        // Iterate over problematic variants and remove corresponding items
        for (const variantId of problematicVariantIds) {
          const item = cart?.items?.find((item: any) => item.variant_id === variantId);
          if (item) {
            try {
              await sdk.store.cart.deleteLineItem(cart.id, item.id, {}, headers);
              removedItems.push(item.product_title || 'Unknown product');
            } catch (deleteError) {
              // Silent failure - item removal failed but continue
            }
          }
        }

        // Retry region update after removing problematic items
        if (removedItems.length > 0) {
          await updateCart({ region_id: region.id });
        }
      } catch (fetchError) {
        throw new Error('Failed to handle incompatible cart items');
      }
    }

    // Revalidate caches
    const cartCacheTag = await getCacheTag('carts');
    revalidateTag(cartCacheTag);
  }

  const regionCacheTag = await getCacheTag('regions');
  revalidateTag(regionCacheTag);

  const productsCacheTag = await getCacheTag('products');
  revalidateTag(productsCacheTag);

  return {
    removedItems,
    newPath: `/${countryCode}${currentPath}`
  };
}

export async function listCartOptions() {
  const cartId = await getCartId();
  const headers = {
    ...(await getAuthHeaders())
  };
  const next = {
    ...(await getCacheOptions('shippingOptions'))
  };

  return await sdk.client.fetch<{
    shipping_options: any[];
  }>('/store/shipping-options', {
    query: { cart_id: cartId },
    next,
    headers,
    cache: 'force-cache'
  });
}
