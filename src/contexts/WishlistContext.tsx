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
const GUEST_SYNC_KEY = '__guest_wishlist__';

function loadFromStorage(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed as WishlistItem[];

    console.error('[WishlistContext] Invalid wishlist data found in localStorage.');
  } catch (error) {
    console.error('[WishlistContext] Failed to read wishlist from localStorage:', error);
  }
  return [];
}

function saveToStorage(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[WishlistContext] Failed to save wishlist to localStorage:', error);
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[WishlistContext] Failed to clear wishlist from localStorage:', error);
  }
}

function mergeWishlistItems(remoteItems: WishlistItem[], guestItems: WishlistItem[]) {
  const merged = new Map<string, WishlistItem>();

  remoteItems.forEach((item) => {
    merged.set(item.id, item);
  });

  guestItems.forEach((item) => {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  });

  return Array.from(merged.values());
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
    console.error(`[WishlistContext] Failed to fetch wishlist from Supabase for user ${userId}:`, error);
    throw error;
  }
  return (data || [])
    .map((row: any) => row.product_data as WishlistItem | null)
    .filter((item: WishlistItem | null): item is WishlistItem => Boolean(item));
}

async function upsertSupabaseItems(userId: string, items: WishlistItem[]) {
  if (items.length === 0) return;

  const payload = items.map((item) => ({
    user_id: userId,
    product_id: item.id,
    product_data: item,
  }));

  const { error } = await (supabase as any)
    .from('wishlists')
    .upsert(payload, { onConflict: 'user_id,product_id' });

  if (error) {
    console.error(`[WishlistContext] Failed to migrate wishlist items to Supabase for user ${userId}:`, error);
    throw error;
  }
}

async function upsertSupabaseItem(userId: string, item: WishlistItem) {
  const { error } = await (supabase as any).from('wishlists').upsert(
    { user_id: userId, product_id: item.id, product_data: item },
    { onConflict: 'user_id,product_id' }
  );
  if (error) {
    console.error(`[WishlistContext] Failed to upsert wishlist item for user ${userId}:`, error);
    throw error;
  }
}

async function deleteSupabaseItem(userId: string, productId: string) {
  const { error } = await (supabase as any)
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) {
    console.error(`[WishlistContext] Failed to delete wishlist item for user ${userId}:`, error);
    throw error;
  }
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(wishlistReducer, []);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  const syncKey = user?.id ?? GUEST_SYNC_KEY;
  const loading = authLoading || hydratedKey !== syncKey;

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const syncWishlist = async () => {
      if (user) {
        try {
          const remoteItems = await fetchSupabaseWishlist(user.id);

          if (cancelled) return;

          const guestItems = loadFromStorage();
          let nextItems = remoteItems;

          if (guestItems.length > 0) {
            nextItems = mergeWishlistItems(remoteItems, guestItems);
            await upsertSupabaseItems(user.id, nextItems);

            if (cancelled) return;

            clearStorage();
          }

          dispatch({ type: 'SET_ITEMS', payload: nextItems });
        } catch (error) {
          console.error(`[WishlistContext] Failed to hydrate wishlist for user ${user.id}:`, error);
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

    void syncWishlist();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !user && hydratedKey === GUEST_SYNC_KEY) {
      saveToStorage(items);
    }
  }, [items, user, authLoading, hydratedKey]);

  const addItem = useCallback((item: WishlistItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });

    if (user) {
      void upsertSupabaseItem(user.id, item).catch((error) => {
        console.error(`[WishlistContext] Failed to sync added wishlist item for user ${user.id}:`, error);
      });
    }
  }, [user]);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });

    if (user) {
      void deleteSupabaseItem(user.id, id).catch((error) => {
        console.error(`[WishlistContext] Failed to sync removed wishlist item for user ${user.id}:`, error);
      });
    }
  }, [user]);

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
