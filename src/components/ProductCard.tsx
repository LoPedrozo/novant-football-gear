import { Heart } from 'lucide-react';
import type { Product } from '@/lib/mockData';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <div className="group cursor-pointer bg-white border border-[#eae7e0] rounded-lg overflow-hidden hover:border-[#7BAF8E] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f2efea]">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-[#1A2F23] text-[#E8E3DA] text-[10px] font-bold uppercase tracking-wider px-3 py-1">
            -{discount}%
          </span>
        )}
        <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="h-4 w-4 text-[#1A2F23]" strokeWidth={1.5} />
        </button>
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
      </div>
    </div>
  );
};

export default ProductCard;
