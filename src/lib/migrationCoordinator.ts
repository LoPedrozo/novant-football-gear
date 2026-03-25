/**
 * Coordinates guest-to-Supabase migration order between CartContext and WishlistContext.
 *
 * Problem: both contexts listen to the same auth state change and kick off migration
 * simultaneously, causing race conditions in Supabase writes.
 *
 * Solution: CartContext migrates first and signals completion via a per-userId deferred
 * promise. WishlistContext awaits that promise before starting its own migration.
 *
 * The deferred promise is created on first access (whichever context calls first),
 * so the ordering is robust regardless of which useEffect fires first.
 */

type MigrationEntry = {
  promise: Promise<void>;
  resolve: () => void;
};

const sessions = new Map<string, MigrationEntry>();

function getOrCreate(userId: string): MigrationEntry {
  if (!sessions.has(userId)) {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => {
      resolve = res;
    });
    sessions.set(userId, { promise, resolve });
  }
  return sessions.get(userId)!;
}

/**
 * Called by CartContext when cart migration is fully complete (or when there is
 * nothing to migrate). Always call this — even on error — so wishlist is not
 * blocked forever.
 */
export function signalCartMigrationDone(userId: string): void {
  console.log('[MigrationCoordinator] Cart sync complete, unblocking wishlist.', { userId });
  getOrCreate(userId).resolve();
}

/**
 * Called by WishlistContext before starting its own migration.
 * Resolves immediately if cart already signalled done.
 */
export function waitForCartMigration(userId: string): Promise<void> {
  console.log('[MigrationCoordinator] Wishlist waiting for cart to finish.', { userId });
  return getOrCreate(userId).promise;
}

/** Clean up after a session ends (user logs out). */
export function clearMigrationSession(userId: string): void {
  sessions.delete(userId);
}
