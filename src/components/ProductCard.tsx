import { Star, Heart } from 'lucide-react';
import type { Product } from '@/lib/mockData';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <div className="group cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted mb-4">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
            -{discount}%
          </span>
        )}
        <button className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="h-4 w-4 text-foreground" strokeWidth={1.5} />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({product.reviews_count})</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm font-bold text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.original_price && (
            <span className="text-xs text-muted-foreground line-through">
              R$ {product.original_price.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
