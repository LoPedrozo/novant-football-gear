import { createContext, useContext, useReducer, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CartItem = {
  id: string;
  name: string;
  brand: string;
  image_url: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size: string; color: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; size: string; color: string; quantity: number } }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const STORAGE_KEY = 'novant_cart';
const GUEST_SYNC_KEY = '__guest_cart__';

function itemKey(id: string, size: string, color: string) {
  return `${id}__${size}__${color}`;
}

function loadFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed as CartItem[];

    console.error('[CartContext] Invalid cart data found in localStorage.');
  } catch (error) {
    console.error('[CartContext] Failed to read cart from localStorage:', error);
  }
  return [];
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[CartContext] Failed to save cart to localStorage:', error);
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[CartContext] Failed to clear cart from localStorage:', error);
  }
}

function mergeCartItems(remoteItems: CartItem[], guestItems: CartItem[]) {
  const merged = new Map<string, CartItem>();

  remoteItems.forEach((item) => {
    merged.set(itemKey(item.id, item.size, item.color), item);
  });

  guestItems.forEach((item) => {
    const key = itemKey(item.id, item.size, item.color);
    const existing = merged.get(key);

    if (existing) {
      merged.set(key, { ...existing, quantity: existing.quantity + item.quantity });
      return;
    }

    merged.set(key, item);
  });

  return Array.from(merged.values());
}

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { id, size, color } = action.payload;
      const existing = state.find(
        (item) => item.id === id && item.size === size && item.color === color
      );
      if (existing) {
        return state.map((item) =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }
      return [...state, action.payload];
    }
    case 'REMOVE_ITEM': {
      const { id, size, color } = action.payload;
      return state.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      );
    }
    case 'UPDATE_QUANTITY': {
      const { id, size, color, quantity } = action.payload;
      if (quantity < 1) return state;
      return state.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      );
    }
    case 'SET_ITEMS':
      return action.payload;
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

// Supabase helpers
async function fetchSupabaseCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await (supabase as any)
    .from('cart_items')
    .select('item_key, item_data')
    .eq('user_id', userId);
  if (error) {
    console.error(`[CartContext] Failed to fetch cart from Supabase for user ${userId}:`, error);
    throw error;
  }
  return (data || [])
    .map((row: any) => row.item_data as CartItem | null)
    .filter((item: CartItem | null): item is CartItem => Boolean(item));
}

async function upsertSupabaseCartItems(userId: string, items: CartItem[]) {
  if (items.length === 0) return;

  const payload = items.map((item) => ({
    user_id: userId,
    item_key: itemKey(item.id, item.size, item.color),
    product_id: item.id,
    item_data: item,
  }));

  const { error } = await (supabase as any)
    .from('cart_items')
    .upsert(payload, { onConflict: 'user_id,item_key' });

  if (error) {
    console.error(`[CartContext] Failed to migrate cart items to Supabase for user ${userId}:`, error);
    throw error;
  }
}

async function upsertSupabaseCartItem(userId: string, item: CartItem) {
  const key = itemKey(item.id, item.size, item.color);
  const { error } = await (supabase as any).from('cart_items').upsert(
    { user_id: userId, item_key: key, product_id: item.id, item_data: item },
    { onConflict: 'user_id,item_key' }
  );
  if (error) {
    console.error(`[CartContext] Failed to upsert cart item for user ${userId}:`, error);
    throw error;
  }
}

async function deleteSupabaseCartItem(userId: string, id: string, size: string, color: string) {
  const key = itemKey(id, size, color);
  const { error } = await (supabase as any)
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('item_key', key);
  if (error) {
    console.error(`[CartContext] Failed to delete cart item for user ${userId}:`, error);
    throw error;
  }
}

async function clearSupabaseCart(userId: string) {
  const { error } = await (supabase as any)
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) {
    console.error(`[CartContext] Failed to clear cart for user ${userId}:`, error);
    throw error;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  const syncKey = user?.id ?? GUEST_SYNC_KEY;
  const loading = authLoading || hydratedKey !== syncKey;

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const syncCart = async () => {
      if (user) {
        try {
          const remoteItems = await fetchSupabaseCart(user.id);

          if (cancelled) return;

          const guestItems = loadFromStorage();
          let nextItems = remoteItems;

          if (guestItems.length > 0) {
            nextItems = mergeCartItems(remoteItems, guestItems);
            await upsertSupabaseCartItems(user.id, nextItems);

            if (cancelled) return;

            clearStorage();
          }

          dispatch({ type: 'SET_ITEMS', payload: nextItems });
        } catch (error) {
          console.error(`[CartContext] Failed to hydrate cart for user ${user.id}:`, error);
          dispatch({ type: 'SET_ITEMS', payload: [] });
        } finally {
          if (!cancelled) {
            setHydratedKey(user.id);
          }
        }
        return;
      }

      dispatch({ type: 'SET_ITEMS', payload: loadFromStorage() });
      setHydratedKey(GUEST_SYNC_KEY);
    };

    void syncCart();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !user && hydratedKey === GUEST_SYNC_KEY) {
      saveToStorage(items);
    }
  }, [items, user, authLoading, hydratedKey]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });

    if (user) {
      const existing = items.find(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      const nextItem = existing
        ? { ...existing, quantity: existing.quantity + item.quantity }
        : item;

      void upsertSupabaseCartItem(user.id, nextItem).catch((error) => {
        console.error(`[CartContext] Failed to sync added cart item for user ${user.id}:`, error);
      });
    }
  }, [user, items]);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size, color } });

    if (user) {
      void deleteSupabaseCartItem(user.id, id, size, color).catch((error) => {
        console.error(`[CartContext] Failed to sync removed cart item for user ${user.id}:`, error);
      });
    }
  }, [user]);

  const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
    if (quantity < 1) return;

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, color, quantity } });

    if (user) {
      const item = items.find(
        (i) => i.id === id && i.size === size && i.color === color
      );

      if (item) {
        void upsertSupabaseCartItem(user.id, { ...item, quantity }).catch((error) => {
          console.error(`[CartContext] Failed to sync updated cart quantity for user ${user.id}:`, error);
        });
      }
    }
  }, [user, items]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });

    if (user) {
      void clearSupabaseCart(user.id).catch((error) => {
        console.error(`[CartContext] Failed to sync cleared cart for user ${user.id}:`, error);
      });
      return;
    }

    clearStorage();
  }, [user]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, loading, addItem, removeItem, updateQuantity, clearCart, isOpen, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
