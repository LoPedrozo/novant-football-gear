// Product image resolution utility.
//
// Priority order:
//   1. External URLs (http/https) — Supabase Storage, CDN, etc. → pass through directly
//   2. Local asset paths (/src/assets/...) → resolved via Vite's import map (legacy fallback)
//   3. Null / empty → /placeholder.svg

// Eagerly bundle any remaining local assets so they still work in production builds.
const imageModules = import.meta.glob<{ default: string }>(
  '@/assets/products/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const localImageMap: Record<string, string> = {};
for (const [path, mod] of Object.entries(imageModules)) {
  const normalized = path.replace(/^.*\/src\//, '/src/');
  localImageMap[normalized] = mod.default;
  localImageMap[path.split('/').pop()!] = mod.default;
}

/**
 * Resolves a product image URL to a usable <img src> value.
 *
 * @param imageUrl - The raw value from the database (image_url or image_url_alt)
 * @returns A URL safe to use as an img src attribute
 */
export function resolveProductImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '/placeholder.svg';

  // 1. External URL (Supabase Storage / CDN) — use as-is, no auth needed
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // 2. Local bundled asset — resolve via Vite import map
  const normalized = imageUrl.replace(/^.*\/src\//, '/src/');
  if (localImageMap[normalized]) return localImageMap[normalized];
  const filename = imageUrl.split('/').pop()!;
  if (localImageMap[filename]) return localImageMap[filename];

  // 3. Unknown — return as-is (Vite will serve it from /public if it exists)
  return imageUrl;
}
