import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Loader2, ChevronRight, Shield, RefreshCw, Truck, BadgeCheck, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { resolveProductImage } from '@/lib/productImages';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import SizeGuideModal from '@/components/SizeGuideModal';
import AuthModal from '@/components/AuthModal';

type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile_name?: string | null;
  profile_avatar?: string | null;
};

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

const StarRating = ({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) => {
  const [hover, setHover] = useState(0);
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} transition-colors ${
            i <= (hover || value) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'
          } ${onChange ? 'cursor-pointer' : ''}`}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
        />
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem, openCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

      // Fetch reviews
      const reviewsData = await fetchReviewsWithProfiles(data.id);
      setReviews(reviewsData);

      setLoading(false);
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const userReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  const fetchReviewsWithProfiles = async (productId: string): Promise<Review[]> => {
    const { data: rows, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error || !rows || rows.length === 0) return rows as Review[] || [];

    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    return rows.map((r) => ({
      ...r,
      profile_name: profileMap.get(r.user_id)?.full_name || null,
      profile_avatar: profileMap.get(r.user_id)?.avatar_url || null,
    }));
  };

  const refetchReviews = async (productId: string) => {
    const result = await fetchReviewsWithProfiles(productId);
    setReviews(result);
  };

  const handleSubmitReview = async () => {
    if (!user || !product || reviewRating === 0) return;
    setSubmittingReview(true);

    try {
      if (editingReviewId) {
        const { error } = await supabase
          .from('reviews')
          .update({ rating: reviewRating, comment: reviewComment || null })
          .eq('id', editingReviewId);
        if (error) {
          toast.error(`Erro: ${error.message}`);
          return;
        }
        setEditingReviewId(null);
        setReviewRating(0);
        setReviewComment('');
        await refetchReviews(product.id);
        toast.success('Avaliação atualizada!');
      } else {
        const { error } = await supabase.from('reviews').insert({
          product_id: product.id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment || null,
        }).select();
        if (error) {
          toast.error(`Erro: ${error.message}`);
          return;
        }
        setReviewRating(0);
        setReviewComment('');
        await refetchReviews(product.id);
        toast.success('Avaliação enviada com sucesso!');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment || '');
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!product) return;
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    setConfirmDeleteId(null);
    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      await refetchReviews(product.id);
      toast.success('Avaliação removida');
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewComment('');
  };

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
            <div className="flex items-center gap-1.5 -mt-3">
              {reviews.length > 0 ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(avgRating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#eae7e0]'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-[#aaaaaa] ml-1">
                    ({reviews.length})
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-[#aaaaaa]">Sem avaliações ainda</span>
              )}
            </div>

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

        {/* Reviews Section */}
        <div className="mt-16 pt-10 border-t border-[#eae7e0] max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[10px] font-extrabold text-[#aaaaaa] uppercase tracking-[5px]">Avaliações</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} size="sm" />
                <span className="text-xs text-[#aaaaaa]">
                  {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}
          </div>

          {/* Write / Edit review */}
          {user ? (
            userReview && !editingReviewId ? (
              <div className="mb-8 p-5 bg-white border border-[#eae7e0]">
                <p className="text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-3">Sua avaliação</p>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1A2F23] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {userReview.profile_avatar ? (
                      <img src={userReview.profile_avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[#E8E3DA]">
                        {(userReview.profile_name || user.user_metadata?.full_name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[#1A2F23]">{userReview.profile_name || user.user_metadata?.full_name || 'Usuário'}</span>
                      <span className="text-[10px] text-[#aaaaaa]">{DATE_FMT.format(new Date(userReview.created_at))}</span>
                    </div>
                    <StarRating value={userReview.rating} size="sm" />
                    {userReview.comment && (
                      <p className="text-sm text-[#1A2F23]/80 mt-2 leading-relaxed">{userReview.comment}</p>
                    )}
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => handleEditReview(userReview)}
                        className="flex items-center gap-1 text-[10px] text-[#7BAF8E] uppercase tracking-[2px] font-medium hover:text-[#1A2F23] transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Editar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(userReview.id)}
                        className="flex items-center gap-1 text-[10px] text-red-400 uppercase tracking-[2px] font-medium hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-5 bg-white border border-[#eae7e0]">
                <p className="text-[10px] text-[#1A2F23] uppercase tracking-[2px] font-medium mb-3">
                  {editingReviewId ? 'Editar avaliação' : 'Escreva uma avaliação'}
                </p>
                <StarRating value={reviewRating} onChange={setReviewRating} />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Conte sua experiência com este produto..."
                  rows={3}
                  className="w-full mt-3 rounded-none border border-gray-200 bg-white px-4 py-3 text-sm text-[#1A2F23] placeholder:text-[#aaaaaa] focus:border-[#1A2F23] focus:outline-none transition-colors resize-none"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || submittingReview}
                    className="bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[3px] font-medium px-6 py-3 hover:bg-[#243b2e] transition-colors disabled:opacity-40 flex items-center gap-2"
                  >
                    {submittingReview && <Loader2 className="h-3 w-3 animate-spin" />}
                    {editingReviewId ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
                  </button>
                  {editingReviewId && (
                    <button
                      onClick={handleCancelEdit}
                      className="border border-[#eae7e0] text-[#aaaaaa] rounded-none text-[10px] uppercase tracking-[3px] font-medium px-6 py-3 hover:border-[#1A2F23] hover:text-[#1A2F23] transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="mb-8 p-5 bg-white border border-[#eae7e0] text-center">
              <p className="text-xs text-[#aaaaaa] mb-3">Faça login para avaliar este produto</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[3px] font-medium px-6 py-3 hover:bg-[#243b2e] transition-colors"
              >
                Entrar
              </button>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="text-xs text-[#aaaaaa] text-center py-8">Seja o primeiro a avaliar este produto!</p>
          ) : (
            <div className="space-y-4">
              {reviews.filter((r) => r.id !== editingReviewId && r.user_id !== user?.id).map((review) => {
                const name = review.profile_name || 'Usuário';
                const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <div key={review.id} className="p-5 bg-white border border-[#eae7e0]">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1A2F23] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {review.profile_avatar ? (
                          <img src={review.profile_avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#E8E3DA]">{initials}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[#1A2F23]">{name}</span>
                          <span className="text-[10px] text-[#aaaaaa]">{DATE_FMT.format(new Date(review.created_at))}</span>
                        </div>
                        <StarRating value={review.rating} size="sm" />
                        {review.comment && (
                          <p className="text-sm text-[#1A2F23]/80 mt-2 leading-relaxed">{review.comment}</p>
                        )}
                        {user && review.user_id === user.id && (
                          <div className="flex gap-3 mt-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="flex items-center gap-1 text-[10px] text-[#7BAF8E] uppercase tracking-[2px] font-medium hover:text-[#1A2F23] transition-colors"
                            >
                              <Pencil className="h-3 w-3" /> Editar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(review.id)}
                              className="flex items-center gap-1 text-[10px] text-red-400 uppercase tracking-[2px] font-medium hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete confirmation dialog */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDeleteId(null)}>
            <div className="bg-white p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-[#1A2F23] font-medium mb-1">Excluir avaliação?</p>
              <p className="text-xs text-[#aaaaaa] mb-5">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteReview(confirmDeleteId)}
                  className="flex-1 bg-red-500 text-white rounded-none text-[10px] uppercase tracking-[3px] font-medium py-3 hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[3px] font-medium py-3 hover:border-[#1A2F23] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

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
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default ProductDetail;
