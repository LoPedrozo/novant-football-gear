import { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveProductImage } from '@/lib/productImages';
import { waitForCartMigration } from '@/lib/migrationCoordinator';

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

function mergeGuestWishlistSources(memoryItems: WishlistItem[], storedItems: WishlistItem[]) {
  const merged = new Map<string, WishlistItem>();

  storedItems.forEach((item) => {
    merged.set(item.id, item);
  });

  memoryItems.forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
}

function normalizeWishlistRows(rows: WishlistRow[]) {
  const uniqueProductIds = new Set<string>();

  return rows.filter((row) => {
    if (uniqueProductIds.has(row.product_id)) {
      return false;
    }

    uniqueProductIds.add(row.product_id);
    return true;
  });
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

  const rows = normalizeWishlistRows((data ?? []) as WishlistRow[]);

  console.log('[WishlistContext] Wishlist rows fetched from Supabase.', {
    userId,
    count: rows.length,
    rawCount: data?.length ?? 0,
  });

  return rows;
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

async function upsertSupabaseWishlistItem(userId: string, productId: string) {
  const { error } = await (supabase as any)
    .from('wishlists')
    .upsert(
      { user_id: userId, product_id: productId },
      { onConflict: 'user_id,product_id' }
    );

  if (error) {
    console.error('[WishlistContext] Failed to upsert wishlist item:', { userId, productId, error });
    throw error;
  }
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
  const userId = user?.id ?? null;
  const guestItemsRef = useRef<WishlistItem[]>([]);
  const guestMigrationPromiseRef = useRef<Promise<void> | null>(null);

  const syncKey = userId ?? GUEST_SYNC_KEY;
  const loading = authLoading || hydratedKey !== syncKey;

  useEffect(() => {
    if (!userId && hydratedKey === GUEST_SYNC_KEY) {
      guestItemsRef.current = items;
    }
  }, [items, userId, hydratedKey]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const syncWishlist = async () => {
      console.log('[WishlistContext] Starting wishlist sync.', { userId });

      if (userId) {
        try {
          // Wait for cart migration to complete first — prevents simultaneous Supabase writes
          await waitForCartMigration(userId);
          console.log('[WishlistContext] Cart sync confirmed, starting wishlist sync.', { userId });

          let nextItems = await fetchSupabaseWishlist(userId);
          const guestItems = mergeGuestWishlistSources(guestItemsRef.current, loadFromStorage());

          if (guestItems.length > 0 && !guestMigrationPromiseRef.current) {
            const pendingGuestItems = guestItems;

            console.log('[WishlistContext] Migrating guest wishlist items to Supabase.', {
              userId,
              count: pendingGuestItems.length,
            });

            guestMigrationPromiseRef.current = (async () => {
              try {
                for (const guestItem of pendingGuestItems) {
                  await upsertSupabaseWishlistItem(userId, guestItem.id);
                }
                guestItemsRef.current = [];
                clearStorage();
              } finally {
                guestMigrationPromiseRef.current = null;
              }
            })();
          }

          if (guestMigrationPromiseRef.current) {
            await guestMigrationPromiseRef.current;
            nextItems = await fetchSupabaseWishlist(userId);
          } else {
            guestItemsRef.current = [];
          }

          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: nextItems });
          }
        } catch (error) {
          console.error('[WishlistContext] Failed to hydrate wishlist for authenticated user:', {
            userId,
            error,
          });

          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: [] });
          }
        } finally {
          if (!cancelled) {
            setHydratedKey(userId);
          }
        }

        return;
      }

      const guestItems = loadFromStorage();
      console.log('[WishlistContext] Hydrating guest wishlist from localStorage.', { count: guestItems.length });

      if (!cancelled) {
        guestItemsRef.current = guestItems;
        dispatch({ type: 'SET_ITEMS', payload: guestItems });
        setHydratedKey(GUEST_SYNC_KEY);
      }
    };

    void syncWishlist();

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  useEffect(() => {
    if (!authLoading && !userId && hydratedKey === GUEST_SYNC_KEY) {
      saveToStorage(items);
    }
  }, [items, userId, authLoading, hydratedKey]);

  const addItem = useCallback((item: WishlistItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });

    if (userId) {
      void upsertSupabaseWishlistItem(userId, item.id).catch((error) => {
        console.error('[WishlistContext] addItem sync failed, reverting:', { userId, productId: item.id, error });
        dispatch({ type: 'REMOVE_ITEM', payload: item.id });
      });
    }
  }, [userId]);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });

    if (userId) {
      void deleteSupabaseWishlistItem(userId, id).catch((error) => {
        console.error('[WishlistContext] removeItem sync failed, restoring state:', { userId, productId: id, error });
        void fetchSupabaseWishlist(userId).then((freshItems) => {
          dispatch({ type: 'SET_ITEMS', payload: freshItems });
        });
      });
    }
  }, [userId]);

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
