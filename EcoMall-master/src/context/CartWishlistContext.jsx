import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getJson, postJson, deleteJson, patchJson } from '../services/api';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartWishlistContext = createContext(null);

function mapServerCartRow(row) {
  return {
    id: row.item, // item_id
    title: row.item_name,
    image: row.image,
    price: row.selling_price != null ? `₹${Number(row.selling_price).toFixed(2)}` : '',
    quantity: row.quantity ?? 1,
    cartId: row.cart_id,
    itemId: row.item,
  };
}

function mapServerWishlistRow(row) {
  return {
    id: row.item, // item_id
    title: row.item_name,
    image: row.image,
    price: row.selling_price != null ? `₹${Number(row.selling_price).toFixed(2)}` : '',
    wishlistId: row.wishlist_id,
    itemId: row.item,
  };
}

export function CartWishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.user_id;
  const { showToast } = useToast();

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart_items')) || []; } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist_items')) || []; } catch { return []; }
  });

  // Persist to local storage as a fallback cache
  useEffect(() => { localStorage.setItem('cart_items', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist_items', JSON.stringify(wishlist)); }, [wishlist]);

  // Load from backend when user logs in
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId) {
        // On logout, clear in-memory state so header badges disappear
        setCart([]);
        setWishlist([]);
        return;
      }
      try {
        const [cartRows, wishRows] = await Promise.all([
          getJson(`/EcoMall/cart/?user_id=${userId}`),
          getJson(`/EcoMall/wishlist/?user_id=${userId}`),
        ]);
        if (!cancelled) {
          setCart((cartRows || []).map(mapServerCartRow));
          setWishlist((wishRows || []).map(mapServerWishlistRow));
        }
      } catch (e) {
        // Keep local cache if server not reachable
        console.warn('Load cart/wishlist failed:', e.message);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const addToCart = async (item, quantity = 1) => {
    if (userId) {
      // Server mode
      const row = await postJson('/EcoMall/cart/', { user_id: userId, item_id: item.id, quantity });
      const mapped = mapServerCartRow(row);
      setCart((prev) => {
        const idx = prev.findIndex((p) => p.id === mapped.id);
        if (idx >= 0) {
          const copy = prev.slice();
          copy[idx] = { ...copy[idx], ...mapped };
          return copy;
        }
        return [...prev, mapped];
      });
    } else {
      // Require login for DB-backed persistence
      showToast('Please login to add items to your cart', 'info');
    }
  };

  const addToWishlist = async (item) => {
    if (userId) {
      const row = await postJson('/EcoMall/wishlist/', { user_id: userId, item_id: item.id });
      const mapped = mapServerWishlistRow(row);
      setWishlist((prev) => prev.find((p) => p.id === mapped.id) ? prev : [...prev, mapped]);
    } else {
      showToast('Please login to add items to your wishlist', 'info');
    }
  };

  const updateCartQuantity = async (entry, newQty) => {
    if (userId && entry.cartId) {
      const row = await patchJson(`/EcoMall/cart/${entry.cartId}/`, { quantity: newQty });
      const mapped = mapServerCartRow(row);
      setCart((prev) => prev.map((p) => p.cartId === mapped.cartId ? mapped : p));
    } else {
      setCart((prev) => prev.map((p) => p.id === entry.id ? { ...p, quantity: newQty } : p));
    }
  };

  const removeCartEntry = async (entry) => {
    try {
      if (userId) {
        let targetId = entry.cartId;
        if (!targetId) {
          // Fallback: resolve cartId by fetching current cart and matching itemId
          const rows = await getJson(`/EcoMall/cart/?user_id=${userId}`);
          const match = (rows || []).find((r) => r.item === (entry.itemId || entry.id));
          targetId = match?.cart_id;
        }
        if (targetId) {
          await deleteJson(`/EcoMall/cart/${targetId}/`);
          // Refresh from server to be sure
          const rows = await getJson(`/EcoMall/cart/?user_id=${userId}`);
          setCart((rows || []).map(mapServerCartRow));
          showToast('Removed from cart', 'success');
          return;
        }
      }
      // Local fallback
      setCart((prev) => prev.filter((p) => p.id !== entry.id));
    } catch (e) {
      console.warn('removeCartEntry failed', e);
      showToast('Failed to remove from cart', 'error');
    }
  };

  const removeWishlistEntry = async (entry) => {
    try {
      if (userId) {
        let targetId = entry.wishlistId;
        if (!targetId) {
          const rows = await getJson(`/EcoMall/wishlist/?user_id=${userId}`);
          const match = (rows || []).find((r) => r.item === (entry.itemId || entry.id));
          targetId = match?.wishlist_id;
        }
        if (targetId) {
          await deleteJson(`/EcoMall/wishlist/${targetId}/`);
          const rows = await getJson(`/EcoMall/wishlist/?user_id=${userId}`);
          setWishlist((rows || []).map(mapServerWishlistRow));
          showToast('Removed from wishlist', 'success');
          return;
        }
      }
      setWishlist((prev) => prev.filter((p) => p.id !== entry.id));
    } catch (e) {
      console.warn('removeWishlistEntry failed', e);
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const value = useMemo(() => ({
    cart,
    wishlist,
    cartCount: cart.length,
    wishlistCount: wishlist.length,
    addToCart,
    addToWishlist,
    removeCartEntry,
    removeWishlistEntry,
    updateCartQuantity,
  }), [cart, wishlist, userId]);

  return <CartWishlistContext.Provider value={value}>{children}</CartWishlistContext.Provider>;
}

export function useCartWishlist() {
  const ctx = useContext(CartWishlistContext);
  if (!ctx) throw new Error('useCartWishlist must be used within CartWishlistProvider');
  return ctx;
}
