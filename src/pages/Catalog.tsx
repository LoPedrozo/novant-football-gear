import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Loader2, X, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import { categories, brands } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';

const normalize = (str: string) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const ALL_SIZES = ['38', '39', '40', '41', '42', '43', '44'];
const PRICE_MIN = 0;
const PRICE_MAX = 1500;

/* ── Dual-thumb range slider ── */
const PriceRange = ({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = (v: number) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const handlePointer = (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault();
    const track = trackRef.current!;
    const move = (ev: PointerEvent) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const val = Math.round((PRICE_MIN + ratio * (PRICE_MAX - PRICE_MIN)) / 10) * 10;
      if (thumb === 'min') onChange(Math.min(val, max - 10), max);
      else onChange(min, Math.max(val, min + 10));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-[#aaaaaa] mb-2">
        <span>R$ {min.toLocaleString('pt-BR')}</span>
        <span>R$ {max.toLocaleString('pt-BR')}</span>
      </div>
      <div ref={trackRef} className="relative h-6 flex items-center select-none touch-none">
        <div className="absolute left-0 right-0 h-[2px] bg-[#eae7e0] rounded" />
        <div
          className="absolute h-[2px] bg-[#7BAF8E] rounded"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#7BAF8E] cursor-grab -translate-x-1/2"
          style={{ left: `${pct(min)}%` }}
          onPointerDown={handlePointer('min')}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#7BAF8E] cursor-grab -translate-x-1/2"
          style={{ left: `${pct(max)}%` }}
          onPointerDown={handlePointer('max')}
        />
      </div>
    </div>
  );
};

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter state — initialized from URL so first render is already correct
  const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('categoria') || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>(() => searchParams.get('marca') || 'all');
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(() => {
    const s = searchParams.get('tamanho');
    return s ? new Set(s.split(',')) : new Set();
  });
  const [priceMin, setPriceMin] = useState(() => {
    const p = searchParams.get('preco_min');
    return p ? Number(p) : PRICE_MIN;
  });
  const [priceMax, setPriceMax] = useState(() => {
    const p = searchParams.get('preco_max');
    return p ? Number(p) : PRICE_MAX;
  });
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get('ordem') || 'featured');
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get('busca') || '');

  // Tracks what busca we last synced to URL, prevents feedback loop
  const lastSyncedBusca = useRef(searchTerm);
  // Stable ref for setSearchParams (react-router recreates it on every searchParams change)
  const setParamsRef = useRef(setSearchParams);
  setParamsRef.current = setSearchParams;

  // Sync filter state → URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('categoria', selectedCategory);
    if (selectedBrand !== 'all') params.set('marca', selectedBrand);
    if (selectedSizes.size > 0) params.set('tamanho', [...selectedSizes].join(','));
    if (priceMin > PRICE_MIN) params.set('preco_min', String(priceMin));
    if (priceMax < PRICE_MAX) params.set('preco_max', String(priceMax));
    if (sortBy !== 'featured') params.set('ordem', sortBy);
    if (searchTerm) params.set('busca', searchTerm);
    lastSyncedBusca.current = searchTerm;
    setParamsRef.current(params, { replace: true });
  }, [selectedCategory, selectedBrand, selectedSizes, priceMin, priceMax, sortBy, searchTerm]);

  // React to external busca changes (SearchBar client-side navigation)
  const buscaFromUrl = searchParams.get('busca') || '';
  useEffect(() => {
    if (buscaFromUrl !== lastSyncedBusca.current) {
      setSearchTerm(buscaFromUrl);
      lastSyncedBusca.current = buscaFromUrl;
    }
  }, [buscaFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedSizes.size > 0 ? 1 : 0) +
    (priceMin > PRICE_MIN || priceMax < PRICE_MAX ? 1 : 0) +
    (searchTerm ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedSizes(new Set());
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    setSortBy('featured');
    setSearchTerm('');
  };

  // Apply filters
  let filtered = [...products];

  if (searchTerm) {
    const term = normalize(searchTerm);
    filtered = filtered.filter((p) =>
      normalize(p.name).includes(term) || normalize(p.brand).includes(term)
    );
  }
  if (selectedCategory !== 'all') {
    filtered = filtered.filter((p) => p.category && normalize(p.category) === normalize(selectedCategory));
  }
  if (selectedBrand !== 'all') {
    filtered = filtered.filter((p) => p.brand === selectedBrand);
  }
  if (selectedSizes.size > 0) {
    filtered = filtered.filter((p) =>
      p.sizes && p.sizes.some((s: string) => selectedSizes.has(s))
    );
  }
  filtered = filtered.filter((p) => p.price >= priceMin && p.price <= priceMax);

  // Sort
  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'discount') {
    const disc = (p: any) => p.original_price ? (p.original_price - p.price) / p.original_price : 0;
    filtered.sort((a, b) => disc(b) - disc(a));
  } else {
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  /* ── Filter controls (shared between desktop bar and mobile drawer) ── */
  const filterControls = (mobile: boolean) => (
    <div className={mobile ? 'flex flex-col gap-6' : 'flex flex-wrap items-center gap-4'}>
      {/* Category */}
      <div className={mobile ? '' : ''}>
        {mobile && <p className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] mb-2">Categoria</p>}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className={`${mobile ? 'w-full' : 'w-[160px]'} rounded-none text-xs border-[#eae7e0]`}>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div>
        {mobile && <p className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] mb-2">Marca</p>}
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className={`${mobile ? 'w-full' : 'w-[160px]'} rounded-none text-xs border-[#eae7e0]`}>
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sizes */}
      <div>
        {mobile && <p className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] mb-2">Tamanho</p>}
        <div className={`flex ${mobile ? 'flex-wrap' : ''} gap-1.5`}>
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`min-w-[36px] h-[36px] px-2 text-[11px] font-medium rounded-none border transition-all duration-200 ${
                selectedSizes.has(size)
                  ? 'border-[#1A2F23] bg-[#1A2F23] text-white'
                  : 'border-[#eae7e0] text-[#aaaaaa] hover:border-[#1A2F23] hover:text-[#1A2F23]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className={mobile ? '' : 'w-[200px]'}>
        {mobile && <p className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] mb-2">Preço</p>}
        <PriceRange
          min={priceMin}
          max={priceMax}
          onChange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
        />
      </div>

      {/* Sort */}
      <div>
        {mobile && <p className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] mb-2">Ordenar</p>}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className={`${mobile ? 'w-full' : 'w-[160px]'} rounded-none text-xs border-[#eae7e0]`}>
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Relevância</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
            <SelectItem value="discount">Maior desconto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative bg-[#1A2F23] py-20 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,175,142,0.06), transparent 50%)' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-extrabold text-[#E8E3DA] uppercase tracking-[5px] mb-3"
          >
            Catálogo
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-9 h-[1.5px] bg-[#7BAF8E] mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs text-[#E8E3DA]/30 font-light tracking-[4px] uppercase"
          >
            Encontre o equipamento perfeito
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* ── Desktop filters ── */}
        <div className="hidden md:block mb-10 pb-6 border-b border-[#eae7e0]">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-[10px] font-medium text-[#aaaaaa] uppercase tracking-[2.5px]">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} /> Filtrar:
            </div>
            <div className="ml-auto flex items-center gap-4">
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] text-[#7BAF8E] hover:text-[#1A2F23] uppercase tracking-[2px] font-medium transition-colors"
                >
                  Limpar filtros
                </button>
              )}
              <span className="text-[10px] text-[#aaaaaa] uppercase tracking-[2.5px]">
                {loading ? '...' : `${filtered.length} produtos encontrados`}
              </span>
            </div>
          </div>
          {filterControls(false)}
        </div>

        {/* ── Mobile filter button + count ── */}
        <div className="flex md:hidden items-center justify-between mb-6 pb-4 border-b border-[#eae7e0]">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px] border border-[#eae7e0] px-4 py-2.5 rounded-none"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            Filtrar
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-[#7BAF8E] text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          <span className="text-[10px] text-[#aaaaaa] uppercase tracking-[2.5px]">
            {loading ? '...' : `${filtered.length} produtos`}
          </span>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-white z-50 overflow-y-auto"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#eae7e0]">
                  <h2 className="text-sm font-bold text-[#1A2F23] uppercase tracking-[3px]">Filtros</h2>
                  <button onClick={() => setMobileOpen(false)}>
                    <X className="h-5 w-5 text-[#aaaaaa] hover:text-[#1A2F23] transition-colors" />
                  </button>
                </div>
                <div className="px-6 py-6">
                  {filterControls(true)}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => { resetFilters(); setMobileOpen(false); }}
                      className="flex-1 border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[3px] font-medium py-3 hover:border-[#7BAF8E] transition-colors"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[3px] font-medium py-3"
                    >
                      Ver {filtered.length} produtos
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search term display */}
        {searchTerm && (
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#eae7e0]">
            <Search className="h-4 w-4 text-[#aaaaaa]" strokeWidth={1.5} />
            <span className="text-xs text-[#1A2F23]">
              Resultados para: <span className="font-bold">&lsquo;{searchTerm}&rsquo;</span>
            </span>
            <button
              onClick={() => setSearchTerm('')}
              className="ml-1 text-[#aaaaaa] hover:text-[#1A2F23] transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#7BAF8E]" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-[#aaaaaa] text-xs uppercase tracking-[3px]">Nenhum produto encontrado</p>
            <button
              className="mt-6 border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[4px] font-medium px-8 py-3 hover:border-[#7BAF8E] transition-all duration-300"
              onClick={resetFilters}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
