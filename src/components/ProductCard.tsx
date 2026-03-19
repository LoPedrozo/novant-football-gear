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
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        <button className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Info */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews_count})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {product.original_price.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
