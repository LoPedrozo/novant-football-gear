import { createContext, useContext, useReducer, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveProductImage } from '@/lib/productImages';

export type WishlistItem = {
  id: string;
  name: string;
  brand: string;
  image_url: string;
  price: number;
  original_price?: number;
};

type WishlistRow = {
  product_id: string;
};

type WishlistProductPreview = {
  id: string;
  name: string;
  brand: string;
  image_url: string | null;
  price: number;
  original_price: number | null;
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

function mapWishlistProductToItem(product: WishlistProductPreview): WishlistItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    image_url: resolveProductImage(product.image_url),
    price: product.price,
    original_price: product.original_price ?? undefined,
  };
}

async function fetchWishlistProducts(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, WishlistProductPreview>();
  }

  console.log('[WishlistContext] Fetching product details for wishlist rows.', { productIds });

  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, image_url, price, original_price')
    .in('id', productIds);

  if (error) {
    console.error('[WishlistContext] Failed to fetch products for wishlist rows:', error);
    throw error;
  }

  console.log('[WishlistContext] Product details fetched for wishlist rows.', { count: data?.length ?? 0 });

  return new Map<string, WishlistProductPreview>((data ?? []).map((product) => [product.id, product]));
}

async function fetchWishlistRows(userId: string): Promise<WishlistRow[]> {
  console.log('[WishlistContext] Fetching wishlist rows from Supabase.', { userId });

  const { data, error } = await (supabase as any)
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    console.error('[WishlistContext] Failed to fetch wishlist rows from Supabase:', { userId, error });
    throw error;
  }

  console.log('[WishlistContext] Wishlist rows fetched from Supabase.', { userId, count: data?.length ?? 0 });

  return (data ?? []) as WishlistRow[];
}

async function fetchSupabaseWishlist(userId: string): Promise<WishlistItem[]> {
  const rows = await fetchWishlistRows(userId);

  if (rows.length === 0) {
    console.log('[WishlistContext] No wishlist rows found for user.', { userId });
    return [];
  }

  const productIds = [...new Set(rows.map((row) => row.product_id))];
  const productsById = await fetchWishlistProducts(productIds);
  const items = rows
    .map((row) => {
      const product = productsById.get(row.product_id);

      if (!product) {
        console.warn('[WishlistContext] Product referenced by wishlist row was not found.', { userId, productId: row.product_id });
        return null;
      }

      return mapWishlistProductToItem(product);
    })
    .filter((item: WishlistItem | null): item is WishlistItem => Boolean(item));

  console.log('[WishlistContext] Wishlist hydrated from Supabase.', { userId, count: items.length });

  return items;
}

async function insertSupabaseWishlistItem(userId: string, item: WishlistItem) {
  console.log('[WishlistContext] addItem -> checking existing wishlist row in Supabase.', {
    userId,
    productId: item.id,
  });

  const { data: existingRow, error: existingError } = await (supabase as any)
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId)
    .eq('product_id', item.id)
    .maybeSingle();

  if (existingError) {
    console.error('[WishlistContext] Failed to check existing wishlist row:', {
      userId,
      productId: item.id,
      error: existingError,
    });
    throw existingError;
  }

  if (existingRow) {
    console.log('[WishlistContext] addItem -> wishlist row already exists, skipping insert.', {
      userId,
      productId: item.id,
    });
    return;
  }

  console.log('[WishlistContext] addItem -> inserting wishlist row into Supabase.', {
    userId,
    productId: item.id,
  });

  const { error: insertError } = await (supabase as any)
    .from('wishlists')
    .insert({
      user_id: userId,
      product_id: item.id,
    });

  if (insertError) {
    console.error('[WishlistContext] Failed to insert wishlist row into Supabase:', {
      userId,
      productId: item.id,
      error: insertError,
    });
    throw insertError;
  }

  console.log('[WishlistContext] addItem -> wishlist row inserted successfully.', {
    userId,
    productId: item.id,
  });
}

async function deleteSupabaseWishlistItem(userId: string, productId: string) {
  console.log('[WishlistContext] removeItem -> deleting wishlist row from Supabase.', {
    userId,
    productId,
  });

  const { error } = await (supabase as any)
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('[WishlistContext] Failed to delete wishlist row from Supabase:', {
      userId,
      productId,
      error,
    });
    throw error;
  }

  console.log('[WishlistContext] removeItem -> wishlist row deleted successfully.', {
    userId,
    productId,
  });
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

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
      console.log('[WishlistContext] Starting wishlist sync.', { userId: user?.id ?? null });

      if (user) {
        try {
          let nextItems = await fetchSupabaseWishlist(user.id);
          const guestItems = loadFromStorage();

          if (guestItems.length > 0) {
            console.log('[WishlistContext] Migrating guest wishlist items to Supabase.', {
              userId: user.id,
              count: guestItems.length,
            });

            for (const guestItem of guestItems) {
              await insertSupabaseWishlistItem(user.id, guestItem);
            }

            clearStorage();
            nextItems = mergeWishlistItems(await fetchSupabaseWishlist(user.id), []);
          }

          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: nextItems });
          }
        } catch (error) {
          console.error('[WishlistContext] Failed to hydrate wishlist for authenticated user:', {
            userId: user.id,
            error,
          });

          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: [] });
          }
        } finally {
          if (!cancelled) {
            setHydratedKey(user.id);
          }
        }

        return;
      }

      const guestItems = loadFromStorage();
      console.log('[WishlistContext] Hydrating guest wishlist from localStorage.', { count: guestItems.length });

      if (!cancelled) {
        dispatch({ type: 'SET_ITEMS', payload: guestItems });
        setHydratedKey(GUEST_SYNC_KEY);
      }
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
    console.log('[WishlistContext] addItem called.', { userId: user?.id ?? null, item });
    dispatch({ type: 'ADD_ITEM', payload: item });

    if (user) {
      void insertSupabaseWishlistItem(user.id, item).catch((error) => {
        console.error('[WishlistContext] addItem sync failed:', { userId: user.id, item, error });
      });
      return;
    }

    console.log('[WishlistContext] addItem executed for guest user. Persistence will remain in localStorage.');
  }, [user]);

  const removeItem = useCallback((id: string) => {
    console.log('[WishlistContext] removeItem called.', { userId: user?.id ?? null, productId: id });
    dispatch({ type: 'REMOVE_ITEM', payload: id });

    if (user) {
      void deleteSupabaseWishlistItem(user.id, id).catch((error) => {
        console.error('[WishlistContext] removeItem sync failed:', { userId: user.id, productId: id, error });
      });
      return;
    }

    console.log('[WishlistContext] removeItem executed for guest user. Persistence will remain in localStorage.');
  }, [user]);

  const toggleItem = useCallback((item: WishlistItem) => {
    if (items.some((i) => i.id === item.id)) {
      removeItem(item.id);
      return;
    }

    addItem(item);
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
