import { Link } from 'react-router-dom';
import { Heart, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { resolveProductImage } from '@/lib/productImages';
import { toast } from 'sonner';

const Wishlist = () => {
  const { items, totalItems, removeItem, loading } = useWishlist();
  const { addItem: addToCart, openCart } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      brand: item.brand,
      image_url: item.image_url,
      price: item.price,
      size: '',
      color: '',
      quantity: 1,
    });
    toast.success('Produto adicionado ao carrinho!');
    openCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7BAF8E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[5px] mb-2">
            Meus Favoritos
          </h1>
          <div className="w-9 h-[1.5px] bg-[#7BAF8E] mx-auto mb-4" />
          {totalItems > 0 && (
            <p className="text-[10px] text-[#aaaaaa] uppercase tracking-[2.5px]">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </p>
          )}
        </div>

        {/* Empty state */}
        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Heart className="h-12 w-12 text-[#eae7e0] mb-6" strokeWidth={1} />
            <p className="text-sm text-[#aaaaaa] mb-8">Sua lista de favoritos está vazia</p>
            <Link
              to="/catalogo"
              className="bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium px-8 py-4 hover:bg-[#1A2F23]/90 transition-colors duration-300"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="group bg-white border border-[#eae7e0] rounded-lg overflow-hidden hover:border-[#7BAF8E] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300">
                  {/* Image */}
                  <Link to={`/produto/${item.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-[#f2efea]">
                      <img
                        src={resolveProductImage(item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.original_price && item.original_price > item.price && (
                        <span className="absolute top-3 left-3 bg-[#1A2F23] text-[#E8E3DA] text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                          -{Math.round(((item.original_price - item.price) / item.original_price) * 100)}%
                        </span>
                      )}
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id);
                          toast.success('Removido dos favoritos');
                        }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                      >
                        <X className="h-4 w-4 text-[#1A2F23]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4 space-y-1.5">
                    <p className="text-[8px] font-semibold tracking-[3px] uppercase text-[#7BAF8E]">
                      {item.brand}
                    </p>
                    <Link to={`/produto/${item.id}`}>
                      <h3 className="text-sm font-medium text-[#1A2F23] leading-tight hover:text-[#7BAF8E] transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-sm font-bold text-[#1A2F23]">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-[11px] font-light text-[#bbb] line-through">
                          R$ {item.original_price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>

                    {/* Add to cart button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full mt-3 bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[9px] uppercase tracking-[3px] font-medium py-3 hover:bg-[#1A2F23]/90 transition-colors duration-300"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
