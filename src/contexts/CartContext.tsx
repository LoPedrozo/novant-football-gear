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
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const STORAGE_KEY = 'novant_cart';

function itemKey(id: string, size: string, color: string) {
  return `${id}__${size}__${color}`;
}

function loadFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
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
    console.warn('[CartContext] Failed to fetch cart from Supabase:', error.message);
    throw error;
  }
  return (data || []).map((row: any) => row.item_data as CartItem);
}

async function upsertSupabaseCartItem(userId: string, item: CartItem) {
  const key = itemKey(item.id, item.size, item.color);
  const { error } = await (supabase as any).from('cart_items').upsert(
    { user_id: userId, item_key: key, product_id: item.id, item_data: item },
    { onConflict: 'user_id,item_key' }
  );
  if (error) console.warn('[CartContext] Failed to upsert cart item:', error.message);
}

async function deleteSupabaseCartItem(userId: string, id: string, size: string, color: string) {
  const key = itemKey(id, size, color);
  const { error } = await (supabase as any)
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('item_key', key);
  if (error) console.warn('[CartContext] Failed to delete cart item:', error.message);
}

async function clearSupabaseCart(userId: string) {
  const { error } = await (supabase as any)
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) console.warn('[CartContext] Failed to clear cart:', error.message);
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);

  const userId = user?.id ?? null;

  // Core sync effect: triggers on auth state changes
  useEffect(() => {
    // Wait for auth to finish loading before doing anything
    if (authLoading) return;

    // Already synced for this user (or both null)
    if (userId === syncedUserId) return;

    if (userId) {
      // User logged in — fetch from Supabase
      let cancelled = false;
      setSyncing(true);

      (async () => {
        try {
          const supabaseItems = await fetchSupabaseCart(userId);

          if (cancelled) return;

          // Migrate any guest localStorage items to Supabase
          const localItems = loadFromStorage();
          if (localItems.length > 0) {
            const supabaseKeys = new Set(
              supabaseItems.map((i) => itemKey(i.id, i.size, i.color))
            );
            for (const localItem of localItems) {
              const key = itemKey(localItem.id, localItem.size, localItem.color);
              if (!supabaseKeys.has(key)) {
                await upsertSupabaseCartItem(userId, localItem);
                supabaseItems.push(localItem);
              }
            }
          }

          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: supabaseItems });
            localStorage.removeItem(STORAGE_KEY);
            setSyncedUserId(userId);
            setSyncing(false);
          }
        } catch {
          // Supabase fetch failed — fall back to localStorage
          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: loadFromStorage() });
            setSyncedUserId(userId);
            setSyncing(false);
          }
        }
      })();

      return () => { cancelled = true; };
    } else {
      // Logged out — clear state, preserve nothing in localStorage
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem(STORAGE_KEY);
      setSyncedUserId(null);
      setSyncing(false);
    }
  }, [userId, authLoading, syncedUserId]);

  // Load guest cart from localStorage on first mount (no user)
  useEffect(() => {
    if (!authLoading && !userId) {
      dispatch({ type: 'SET_ITEMS', payload: loadFromStorage() });
      setSyncing(false);
    }
  }, [authLoading, userId]);

  // Persist to localStorage for guests only
  useEffect(() => {
    if (!userId && !syncing) {
      saveToStorage(items);
    }
  }, [items, userId, syncing]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    if (userId) {
      // Read current items to compute merged quantity for Supabase
      const existing = items.find(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      const merged = existing
        ? { ...existing, quantity: existing.quantity + item.quantity }
        : item;
      upsertSupabaseCartItem(userId, merged);
    }
  }, [userId, items]);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size, color } });
    if (userId) {
      deleteSupabaseCartItem(userId, id, size, color);
    }
  }, [userId]);

  const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, color, quantity } });
    if (userId) {
      const item = items.find(
        (i) => i.id === id && i.size === size && i.color === color
      );
      if (item) {
        upsertSupabaseCartItem(userId, { ...item, quantity });
      }
    }
  }, [userId, items]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    if (userId) {
      clearSupabaseCart(userId);
    }
  }, [userId]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, isOpen, openCart, closeCart }}
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
