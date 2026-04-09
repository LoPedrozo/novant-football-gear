import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { resolveProductImage } from '@/lib/productImages';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    original_price?: number | null;
    image_url?: string | null;
    [key: string]: any;
  };
  index?: number;
}

const URGENCY_INDICES = new Set([0, 3, 7]);

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image_url: resolveProductImage(product.image_url),
      price: product.price,
      original_price: product.original_price ?? undefined,
    });
  };

  return (
    <Link to={`/produto/${product.id}`} className="block">
      <div className="group cursor-pointer bg-white border border-[#eae7e0] rounded-lg overflow-hidden hover:border-[#7BAF8E] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#f2efea]">
          <img
            src={resolveProductImage(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-[#1A2F23] text-[#E8E3DA] text-[10px] font-bold uppercase tracking-wider px-3 py-1">
              -{discount}%
            </span>
          )}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 transition-all duration-300 ${
              inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-300 ${
                inWishlist ? 'fill-red-500 text-red-500' : 'text-[#1A2F23]'
              }`}
              strokeWidth={1.5}
            />
          </button>
          {index !== undefined && URGENCY_INDICES.has(index) && (
            <span className="absolute bottom-3 left-3 bg-[#1A2F23] text-white text-xs px-2 py-1 rounded-none">
              🔥 Últimas unidades
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <p className="text-[8px] font-semibold tracking-[3px] uppercase text-[#7BAF8E]">
            {product.brand}
          </p>
          <h3 className="text-sm font-medium text-[#1A2F23] leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-bold text-[#1A2F23]">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.original_price && (
              <span className="text-[11px] font-light text-[#bbb] line-through">
                R$ {product.original_price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 pt-1">
              {product.colors.map((color: string) => {
                const colorMap: Record<string, string> = {
                  "Preto": "#1A1A1A",
                  "Branco": "#F5F5F5",
                  "Rosa": "#FFB6C1",
                  "Vermelho": "#DC2626",
                  "Azul": "#2563EB",
                  "Verde": "#16A34A",
                  "Amarelo": "#FACC15",
                  "Dourado": "#D4AF37",
                  "Marrom": "#8B4513",
                };
                return (
                  <span
                    key={color}
                    title={color}
                    className="w-2.5 h-2.5 rounded-full border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: colorMap[color] ?? '#aaaaaa' }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
