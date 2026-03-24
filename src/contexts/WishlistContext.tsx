import { createContext, useContext, useReducer, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type WishlistItem = {
  id: string;
  name: string;
  brand: string;
  image_url: string;
  price: number;
  original_price?: number;
};

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_ITEMS'; payload: WishlistItem[] }
  | { type: 'CLEAR_WISHLIST' };

interface WishlistContextType {
  items: WishlistItem[];
  totalItems: number;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  loading: boolean;
}

const STORAGE_KEY = 'novant_wishlist';

function loadFromStorage(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveToStorage(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function wishlistReducer(state: WishlistItem[], action: WishlistAction): WishlistItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (state.some((item) => item.id === action.payload.id)) return state;
      return [...state, action.payload];
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.payload);
    case 'SET_ITEMS':
      return action.payload;
    case 'CLEAR_WISHLIST':
      return [];
    default:
      return state;
  }
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Supabase helpers
async function fetchSupabaseWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await (supabase as any)
    .from('wishlists')
    .select('product_id, product_data')
    .eq('user_id', userId);
  if (error) {
    console.warn('[WishlistContext] Failed to fetch wishlist from Supabase:', error.message);
    throw error;
  }
  return (data || []).map((row: any) => row.product_data as WishlistItem);
}

async function upsertSupabaseItem(userId: string, item: WishlistItem) {
  const { error } = await (supabase as any).from('wishlists').upsert(
    { user_id: userId, product_id: item.id, product_data: item },
    { onConflict: 'user_id,product_id' }
  );
  if (error) console.warn('[WishlistContext] Failed to upsert wishlist item:', error.message);
}

async function deleteSupabaseItem(userId: string, productId: string) {
  const { error } = await (supabase as any)
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) console.warn('[WishlistContext] Failed to delete wishlist item:', error.message);
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(wishlistReducer, []);
  const [loading, setLoading] = useState(true);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);

  const userId = user?.id ?? null;

  // Core sync effect: triggers on auth state changes
  useEffect(() => {
    if (authLoading) return;

    if (userId === syncedUserId) return;

    if (userId) {
      // User logged in — fetch from Supabase
      let cancelled = false;
      setLoading(true);

      (async () => {
        try {
          const supabaseItems = await fetchSupabaseWishlist(userId);

          if (cancelled) return;

          // Migrate any guest localStorage items to Supabase
          const localItems = loadFromStorage();
          if (localItems.length > 0) {
            const supabaseIds = new Set(supabaseItems.map((i) => i.id));
            for (const localItem of localItems) {
              if (!supabaseIds.has(localItem.id)) {
                await upsertSupabaseItem(userId, localItem);
                supabaseItems.push(localItem);
              }
            }
          }

          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: supabaseItems });
            localStorage.removeItem(STORAGE_KEY);
            setSyncedUserId(userId);
            setLoading(false);
          }
        } catch {
          // Supabase fetch failed — fall back to localStorage
          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: loadFromStorage() });
            setSyncedUserId(userId);
            setLoading(false);
          }
        }
      })();

      return () => { cancelled = true; };
    } else {
      // Logged out — clear state
      dispatch({ type: 'CLEAR_WISHLIST' });
      localStorage.removeItem(STORAGE_KEY);
      setSyncedUserId(null);
      setLoading(false);
    }
  }, [userId, authLoading, syncedUserId]);

  // Load guest wishlist from localStorage on first mount (no user)
  useEffect(() => {
    if (!authLoading && !userId) {
      dispatch({ type: 'SET_ITEMS', payload: loadFromStorage() });
      setLoading(false);
    }
  }, [authLoading, userId]);

  // Persist to localStorage for guests only
  useEffect(() => {
    if (!userId && !loading) {
      saveToStorage(items);
    }
  }, [items, userId, loading]);

  const addItem = useCallback((item: WishlistItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    if (userId) {
      upsertSupabaseItem(userId, item);
    }
  }, [userId]);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    if (userId) {
      deleteSupabaseItem(userId, id);
    }
  }, [userId]);

  const toggleItem = useCallback((item: WishlistItem) => {
    if (items.some((i) => i.id === item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  }, [items, addItem, removeItem]);

  const isInWishlist = useCallback((id: string) => {
    return items.some((item) => item.id === id);
  }, [items]);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{ items, totalItems, addItem, removeItem, toggleItem, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
