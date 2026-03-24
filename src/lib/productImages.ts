// Eagerly import all product images so Vite bundles them.
// Maps database image_url values (e.g. "/src/assets/products/copa-pure.jpg")
// to hashed build-time URLs that work in production.

const imageModules = import.meta.glob<{ default: string }>(
  '@/assets/products/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const imageMap: Record<string, string> = {};
for (const [path, mod] of Object.entries(imageModules)) {
  // path looks like "/src/assets/products/copa-pure.jpg"
  // Also key by the bare filename for flexibility
  const normalized = path.replace(/^.*\/src\//, '/src/');
  imageMap[normalized] = mod.default;

  const filename = path.split('/').pop()!;
  imageMap[filename] = mod.default;
}

/**
 * Resolves a product image_url to a usable src.
 * - Local asset paths → bundled Vite URL
 * - External URLs (http/https) → passed through
 * - Null/empty → returns the fallback placeholder
 */
export function resolveProductImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '/placeholder.svg';

  // External URL — pass through
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Try matching against the import map
  const normalized = imageUrl.replace(/^.*\/src\//, '/src/');
  if (imageMap[normalized]) return imageMap[normalized];

  const filename = imageUrl.split('/').pop()!;
  if (imageMap[filename]) return imageMap[filename];

  // Unknown path — return as-is (will 404 if truly broken)
  return imageUrl;
}
