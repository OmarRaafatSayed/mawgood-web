'use client';

import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

import {
  addToCart as apiAddToCart,
  deleteLineItem as apiDeleteLineItem,
  updateLineItem as apiUpdateLineItem,
  retrieveCart
} from '@/lib/data/cart';
import { Cart, StoreCartLineItemOptimisticUpdate } from '@/types/cart';

import { CartContext } from './context';

interface CartProviderProps extends PropsWithChildren {
  cart: any;
}

export function CartProvider({ cart, children }: CartProviderProps) {
  const [cartState, setCartState] = useState<any>(cart);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [isRemovingItem, setIsRemovingItem] = useState(false);

  useEffect(() => {
    setCartState(cart);
  }, [cart]);

  const refreshCart = useCallback(async () => {
    try {
      const cartData = await retrieveCart();
      setCartState(cartData);
      return cartData;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }, []);

  function handleAddToCart(newItem: StoreCartLineItemOptimisticUpdate, currency_code: string) {
    setCartState((prev: any) => {
      const currentItems = prev?.items || [];
      const isNewItemInCart = currentItems.find(
        (item: any) => item.variant_id === (newItem as any).variant_id
      );

      if (isNewItemInCart) {
        const updatedItems = currentItems.map((currentItem: any) => {
          if ((currentItem as any).variant_id !== (newItem as any).variant_id) {
            return currentItem;
          }

          const newQuantity = currentItem.quantity + ((newItem as any)?.quantity || 0);
          return {
            ...currentItem,
            quantity: newQuantity,
            subtotal: newQuantity * ((newItem as any)?.subtotal || 0),
            total: newQuantity * ((newItem as any)?.total || 0),
            tax_total: newQuantity * ((newItem as any)?.tax_total || 0)
          };
        });

        const { item_subtotal, total, tax_total } = getItemsSummaryValues(updatedItems);

        return {
          ...prev,
          items: updatedItems,
          item_subtotal,
          total,
          tax_total,
          currency_code
        };
      }

      const updatedItems = [...currentItems, newItem] as StoreCartLineItemOptimisticUpdate[];

      const { item_subtotal, total, tax_total } = getItemsSummaryValues(updatedItems);

      return {
        ...prev,
        items: updatedItems,
        item_subtotal,
        total,
        tax_total,
        currency_code
      };
    });
  }

  const updateCartItem = async (lineId: string, quantity: number) => {
    if (!cartState?.items) return;

    setIsUpdatingItem(true);
    setIsUpdating(true);

    const optimisticCart = {
      ...cartState,
      items: cartState.items.map((item: any) => (item.id === lineId ? { ...item, quantity } : item))
    };

    setCartState(optimisticCart);

    try {
      const res = await apiUpdateLineItem({ lineId, quantity });
      // If the cart was already completed, the server action returns an error object
      // instead of throwing — handle it gracefully here
      if ((res as any)?.error === 'cart_completed') {
        console.log('[CartProvider] Cart completed, refreshing cart state...');
        await refreshCart();
        return;
      }
      await refreshCart();
    } catch (error) {
      console.error('Error updating item quantity:', error);
      await refreshCart();
      // Do NOT re-throw — swallow the error to avoid crashing the UI
    } finally {
      setIsUpdatingItem(false);
      setIsUpdating(false);
    }

  };

  const addToCart = async ({
    variantId,
    quantity,
    countryCode
  }: {
    variantId: string;
    quantity: number;
    countryCode: string;
  }) => {
    setIsAddingItem(true);
    setIsUpdating(true);

    try {
      await apiAddToCart({
        variantId,
        quantity,
        countryCode
      });
      await refreshCart();
    } catch (error) {
      console.error('Error adding product to cart:', error);
      // Don't call refreshCart here - it would overwrite the optimistic update
      // The optimistic update is already done by handleAddToCart
      throw error;
    } finally {
      setIsAddingItem(false);
      setIsUpdating(false);
    }
  };

  const removeCartItem = async (lineId: string) => {
    if (!cartState?.items) return;

    setIsRemovingItem(true);
    setIsUpdating(true);

    const optimisticCart = {
      ...cartState,
      items: cartState.items.filter((item: any) => item.id !== lineId)
    };

    setCartState(optimisticCart);

    try {
      await apiDeleteLineItem(lineId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      await refreshCart();
    } finally {
      setIsRemovingItem(false);
      setIsUpdating(false);
    }
  };

  function getItemsSummaryValues(items: any[]) {
    return items.reduce(
      (acc: any, item: any) => ({
        item_subtotal: (acc.item_subtotal || 0) + (item.subtotal || 0),
        total: (acc.total || 0) + (item.total || 0),
        tax_total: (acc.tax_total || 0) + (item.tax_total || 0)
      }),
      { item_subtotal: 0, total: 0, tax_total: 0 }
    );
  }

  return (
    <CartContext.Provider
      value={{
        cart: cartState,
        onAddToCart: handleAddToCart,
        addToCart,
        removeCartItem,
        updateCartItem,
        refreshCart,
        isUpdating,
        isAddingItem,
        isUpdatingItem,
        isRemovingItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
