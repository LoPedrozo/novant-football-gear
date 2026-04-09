import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Loader2, ChevronRight, Shield, RefreshCw, Truck, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { resolveProductImage } from '@/lib/productImages';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import SizeGuideModal from '@/components/SizeGuideModal';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem, openCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(false);
      const { data, error: err } = await supabase
        .from('products')
        .select('*, image_url_alt')
        .eq('id', id!)
        .single();

      if (err || !data) {
        setError(true);
        setLoading(false);
        return;
      }

      setProduct(data);
      setMainImage(resolveProductImage(data.image_url));
      if (data.sizes?.length) setSelectedSize(data.sizes[0]);
      if (data.colors?.length) setSelectedColor(data.colors[0]);

      // Fetch related products
      const { data: relatedData } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', data.id)
        .limit(4);

      if (relatedData) setRelated(relatedData);
      setLoading(false);
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7BAF8E]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="text-center">
          <h1 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[5px] mb-4">Produto não encontrado</h1>
          <div className="w-9 h-[1.5px] bg-[#7BAF8E] mx-auto mb-6" />
          <Link
            to="/catalogo"
            className="text-[10px] text-[#7BAF8E] hover:text-[#1A2F23] uppercase tracking-[3px] font-medium transition-colors duration-300"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image_url: mainImage,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });
    toast.success('Produto adicionado ao carrinho!');
    openCart();
  };

  const inWishlist = isInWishlist(product.id);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const isFirstColor = color === product.colors?.[0];
    if (!isFirstColor && product.image_url_alt) {
      setMainImage(resolveProductImage(product.image_url_alt));
    } else {
      setMainImage(resolveProductImage(product.image_url));
    }
  };

  const handleToggleFavorites = () => {
    toggleItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image_url: mainImage,
      price: product.price,
      original_price: product.original_price ?? undefined,
    });
    toast.success(inWishlist ? 'Removido dos favoritos' : 'Adicionado aos favoritos!');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[2.5px]">
          <Link to="/" className="text-[#aaaaaa] hover:text-[#1A2F23] transition-colors duration-300">Home</Link>
          <ChevronRight className="h-3 w-3 text-[#aaaaaa]" />
          <Link to="/catalogo" className="text-[#aaaaaa] hover:text-[#1A2F23] transition-colors duration-300">Catálogo</Link>
          <ChevronRight className="h-3 w-3 text-[#aaaaaa]" />
          <span className="text-[#1A2F23] font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product */}
      <div className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-10"
        >
          {/* Image column — 60% */}
          <div className="md:col-span-3">
            <div className="aspect-square overflow-hidden bg-[#f2efea] rounded-lg">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Info column — 40% */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Brand */}
            <p className="text-[8px] font-semibold tracking-[3px] uppercase text-[#7BAF8E]">
              {product.brand}
            </p>

            {/* Name */}
            <h1 className="text-2xl font-bold text-[#1A2F23] leading-tight -mt-4">
              {product.name}
            </h1>

            {(product.featured || product.original_price) && (
              <p className="text-sm font-medium text-[#7BAF8E] -mt-4">
                ⚡ Restam poucas unidades
              </p>
            )}

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1.5 -mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) ? 'fill-[#7BAF8E] text-[#7BAF8E]' : 'text-[#eae7e0]'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-[#aaaaaa] ml-1">
                  ({product.reviews_count || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-[#1A2F23]">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.original_price && (
                <span className="text-sm font-light text-gray-400 line-through">
                  R$ {product.original_price.toFixed(2).replace('.', ',')}
                </span>
              )}
              {discount && (
                <span className="text-[10px] font-bold text-[#7BAF8E] uppercase tracking-wider">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] mb-3">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-[44px] px-3 text-xs font-medium rounded-none border transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-[#1A2F23] text-[#1A2F23]'
                          : 'border-[#eae7e0] text-[#aaaaaa] hover:border-[#1A2F23] hover:text-[#1A2F23]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="mt-2 text-xs text-[#1A2F23] hover:underline cursor-pointer"
                >
                  Guia de Tamanhos &rarr;
                </button>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] mb-3">Cor</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 h-[44px] text-xs font-medium rounded-none border transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-[#1A2F23] border-2 text-[#1A2F23] font-semibold'
                          : 'border-[#eae7e0] text-[#aaaaaa] hover:border-[#1A2F23] hover:text-[#1A2F23]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:bg-[#1A2F23]/90 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Adicionar ao Carrinho
              </button>
              {!selectedSize && (
                <p className="text-[10px] text-[#aaaaaa] mt-2 text-center">Selecione um tamanho</p>
              )}
            </div>

            {/* Add to favorites */}
            <button
              onClick={handleToggleFavorites}
              className="w-full border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:border-[#7BAF8E] transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Heart
                className={`h-4 w-4 transition-colors duration-300 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`}
                strokeWidth={1.5}
              />
              {inWishlist ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#eae7e0]">
              {[
                { icon: Shield, title: 'Compra Segura', subtitle: 'Pagamento 100% seguro' },
                { icon: RefreshCw, title: 'Troca Fácil', subtitle: '30 dias para trocar' },
                { icon: Truck, title: 'Entrega Rápida', subtitle: 'Para todo o Brasil' },
                { icon: BadgeCheck, title: 'Produto Original', subtitle: 'Garantia de autenticidade' },
              ].map((badge) => (
                <div key={badge.title} className="flex flex-col items-center text-center gap-1.5">
                  <badge.icon className="h-5 w-5 text-[#7BAF8E]" strokeWidth={1.5} />
                  <p className="text-[10px] font-bold text-[#1A2F23] uppercase tracking-wide">{badge.title}</p>
                  <p className="text-[10px] text-[#aaaaaa]">{badge.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        {product.description && (() => {
          const lines = product.description.split('\n').filter((l: string) => l.trim() !== '');
          const tagline = lines[0] ?? '';
          const bodyLines = lines.slice(1).filter((l: string) => !l.startsWith('•'));
          const bullets = lines.filter((l: string) => l.startsWith('•'));
          return (
            <div className="mt-16 max-w-3xl">
              <h2 className="text-[10px] font-extrabold text-[#aaaaaa] uppercase tracking-[5px] mb-6">Descrição</h2>
              {tagline && (
                <p className="text-base font-bold text-[#1A2F23] leading-snug mb-4">
                  {tagline}
                </p>
              )}
              {bodyLines.length > 0 && (
                <div className="mb-4 space-y-2">
                  {bodyLines.map((line: string, i: number) => (
                    <p key={i} className="text-sm text-[#aaaaaa] leading-[1.8] font-normal">
                      {line}
                    </p>
                  ))}
                </div>
              )}
              {bullets.length > 0 && (
                <ul className="space-y-2">
                  {bullets.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-[3px] w-1.5 h-1.5 rounded-full bg-[#1A2F23] flex-shrink-0" />
                      <span className="text-xs text-[#aaaaaa] leading-[1.8]">
                        {item.replace(/^•\s*/, '')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })()}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-[10px] font-extrabold text-[#aaaaaa] uppercase tracking-[5px] mb-10">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        initialBrand={product.brand}
      />
    </div>
  );
};

export default ProductDetail;
