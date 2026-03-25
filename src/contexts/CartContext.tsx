import { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveProductImage } from '@/lib/productImages';

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

type CartRow = {
  product_id: string;
  size: string | null;
  color: string | null;
  quantity: number;
};

type CartQuantityRow = {
  quantity: number | null;
};

type ProductPreview = {
  id: string;
  name: string;
  brand: string;
  image_url: string | null;
  price: number;
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

function itemKey(id: string, size: string, color: string) {
  return `${id}__${size}__${color}`;
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

function mergeGuestCartSources(memoryItems: CartItem[], storedItems: CartItem[]) {
  const merged = new Map<string, CartItem>();

  storedItems.forEach((item) => {
    merged.set(itemKey(item.id, item.size, item.color), item);
  });

  memoryItems.forEach((item) => {
    merged.set(itemKey(item.id, item.size, item.color), item);
  });

  return Array.from(merged.values());
}

function normalizeCartRows(rows: CartRow[]) {
  const merged = new Map<string, CartRow>();

  rows.forEach((row) => {
    const normalizedRow = {
      ...row,
      size: row.size ?? '',
      color: row.color ?? '',
    };
    const key = itemKey(normalizedRow.product_id, normalizedRow.size, normalizedRow.color);
    const existing = merged.get(key);

    if (existing) {
      merged.set(key, {
        ...existing,
        quantity: existing.quantity + normalizedRow.quantity,
      });
      return;
    }

    merged.set(key, normalizedRow);
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

function mapCartRowToItem(row: CartRow, product: ProductPreview): CartItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    image_url: resolveProductImage(product.image_url),
    price: product.price,
    size: row.size ?? '',
    color: row.color ?? '',
    quantity: row.quantity,
  };
}

async function fetchProductsByIds(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, ProductPreview>();
  }

  console.log('[CartContext] Fetching product details for cart rows.', { productIds });

  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, image_url, price')
    .in('id', productIds);

  if (error) {
    console.error('[CartContext] Failed to fetch products for cart rows:', error);
    throw error;
  }

  console.log('[CartContext] Product details fetched for cart rows.', { count: data?.length ?? 0 });

  return new Map<string, ProductPreview>((data ?? []).map((product) => [product.id, product]));
}

async function fetchCartRows(userId: string): Promise<CartRow[]> {
  console.log('[CartContext] Fetching cart rows from Supabase.', { userId });

  const { data, error } = await (supabase as any)
    .from('cart_items')
    .select('product_id, size, color, quantity')
    .eq('user_id', userId);

  if (error) {
    console.error('[CartContext] Failed to fetch cart rows from Supabase:', { userId, error });
    throw error;
  }

  const rows = normalizeCartRows((data ?? []) as CartRow[]);

  console.log('[CartContext] Cart rows fetched from Supabase.', {
    userId,
    count: rows.length,
    rawCount: data?.length ?? 0,
  });

  return rows;
}

async function upsertSupabaseCartRow(userId: string, productId: string, size: string, color: string, quantity: number) {
  const normalizedQuantity = Math.max(0, quantity);

  if (normalizedQuantity === 0) {
    const { error } = await (supabase as any)
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('size', size)
      .eq('color', color);

    if (error) {
      console.error('[CartContext] Failed to delete cart row:', { userId, productId, size, color, error });
      throw error;
    }
    return;
  }

  const { error } = await (supabase as any)
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, size, color, quantity: normalizedQuantity },
      { onConflict: 'user_id,product_id,size,color' }
    );

  if (error) {
    console.error('[CartContext] Failed to upsert cart row:', { userId, productId, size, color, quantity: normalizedQuantity, error });
    throw error;
  }
}

async function fetchSupabaseCart(userId: string): Promise<CartItem[]> {
  const rows = await fetchCartRows(userId);

  if (rows.length === 0) {
    console.log('[CartContext] No cart rows found for user.', { userId });
    return [];
  }

  const productIds = [...new Set(rows.map((row) => row.product_id))];
  const productsById = await fetchProductsByIds(productIds);
  const items = rows
    .map((row) => {
      const product = productsById.get(row.product_id);

      if (!product) {
        console.warn('[CartContext] Product referenced by cart row was not found.', { userId, productId: row.product_id });
        return null;
      }

      return mapCartRowToItem(row, product);
    })
    .filter((item: CartItem | null): item is CartItem => Boolean(item));

  console.log('[CartContext] Cart hydrated from Supabase.', { userId, count: items.length });

  return items;
}

async function insertSupabaseCartItem(userId: string, item: CartItem) {
  const { data: existingRows, error: selectError } = await (supabase as any)
    .from('cart_items')
    .select('quantity')
    .eq('user_id', userId)
    .eq('product_id', item.id)
    .eq('size', item.size)
    .eq('color', item.color);

  if (selectError) {
    console.error('[CartContext] Failed to check existing cart row:', { userId, productId: item.id, error: selectError });
    throw selectError;
  }

  const existingQuantity = (existingRows as CartQuantityRow[] ?? [])
    .reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);

  await upsertSupabaseCartRow(userId, item.id, item.size, item.color, existingQuantity + item.quantity);
}

async function updateSupabaseCartQuantity(userId: string, id: string, size: string, color: string, quantity: number) {
  await upsertSupabaseCartRow(userId, id, size, color, quantity);
}

async function deleteSupabaseCartItem(userId: string, id: string, size: string, color: string) {
  console.log('[CartContext] removeItem -> deleting cart row from Supabase.', {
    userId,
    productId: id,
    size,
    color,
  });

  const { error } = await (supabase as any)
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', id)
    .eq('size', size)
    .eq('color', color);

  if (error) {
    console.error('[CartContext] Failed to delete cart row from Supabase:', {
      userId,
      productId: id,
      size,
      color,
      error,
    });
    throw error;
  }

  console.log('[CartContext] removeItem -> cart row deleted successfully.', {
    userId,
    productId: id,
    size,
    color,
  });
}

async function clearSupabaseCart(userId: string) {
  console.log('[CartContext] clearCart -> deleting all cart rows from Supabase.', { userId });

  const { error } = await (supabase as any)
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('[CartContext] Failed to clear cart rows from Supabase:', { userId, error });
    throw error;
  }

  console.log('[CartContext] clearCart -> all cart rows deleted successfully.', { userId });
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const userId = user?.id ?? null;
  const guestItemsRef = useRef<CartItem[]>([]);
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

    const syncCart = async () => {
      console.log('[CartContext] Starting cart sync.', { userId });

      if (userId) {
        try {
          let nextItems = await fetchSupabaseCart(userId);
          const guestItems = mergeGuestCartSources(guestItemsRef.current, loadFromStorage());

          if (guestItems.length > 0 && !guestMigrationPromiseRef.current) {
            const pendingGuestItems = guestItems;

            console.log('[CartContext] Migrating guest cart items to Supabase.', {
              userId,
              count: pendingGuestItems.length,
            });

            guestMigrationPromiseRef.current = (async () => {
              try {
                for (const guestItem of pendingGuestItems) {
                  await insertSupabaseCartItem(userId, guestItem);
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
            nextItems = await fetchSupabaseCart(userId);
          } else {
            guestItemsRef.current = [];
          }

          if (!cancelled) {
            dispatch({ type: 'SET_ITEMS', payload: nextItems });
          }
        } catch (error) {
          console.error('[CartContext] Failed to hydrate cart for authenticated user:', {
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
      console.log('[CartContext] Hydrating guest cart from localStorage.', { count: guestItems.length });

      if (!cancelled) {
        guestItemsRef.current = guestItems;
        dispatch({ type: 'SET_ITEMS', payload: guestItems });
        setHydratedKey(GUEST_SYNC_KEY);
      }
    };

    void syncCart();

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  useEffect(() => {
    if (!authLoading && !userId && hydratedKey === GUEST_SYNC_KEY) {
      saveToStorage(items);
    }
  }, [items, userId, authLoading, hydratedKey]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback((item: CartItem) => {
    console.log('[CartContext] addItem called.', { userId, item });
    dispatch({ type: 'ADD_ITEM', payload: item });

    if (userId) {
      void insertSupabaseCartItem(userId, item).catch((error) => {
        console.error('[CartContext] addItem sync failed:', { userId, item, error });
      });
      return;
    }

    console.log('[CartContext] addItem executed for guest user. Persistence will remain in localStorage.');
  }, [userId]);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    console.log('[CartContext] removeItem called.', { userId, productId: id, size, color });
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size, color } });

    if (userId) {
      void deleteSupabaseCartItem(userId, id, size, color).catch((error) => {
        console.error('[CartContext] removeItem sync failed:', {
          userId,
          productId: id,
          size,
          color,
          error,
        });
      });
      return;
    }

    console.log('[CartContext] removeItem executed for guest user. Persistence will remain in localStorage.');
  }, [userId]);

  const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
    if (quantity < 1) return;

    console.log('[CartContext] updateQuantity called.', {
      userId,
      productId: id,
      size,
      color,
      quantity,
    });

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, color, quantity } });

    if (userId) {
      void updateSupabaseCartQuantity(userId, id, size, color, quantity).catch((error) => {
        console.error('[CartContext] updateQuantity sync failed:', {
          userId,
          productId: id,
          size,
          color,
          quantity,
          error,
        });
      });
      return;
    }

    console.log('[CartContext] updateQuantity executed for guest user. Persistence will remain in localStorage.');
  }, [userId]);

  const clearCart = useCallback(() => {
    console.log('[CartContext] clearCart called.', { userId });
    dispatch({ type: 'CLEAR_CART' });

    if (userId) {
      void clearSupabaseCart(userId).catch((error) => {
        console.error('[CartContext] clearCart sync failed:', { userId, error });
      });
      return;
    }

    clearStorage();
  }, [userId]);

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
