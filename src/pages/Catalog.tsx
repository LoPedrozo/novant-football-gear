import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import { categories, brands } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';

const normalize = (str: string) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    const categoriaParam = searchParams.get('categoria');
    if (categoriaParam) {
      setSelectedCategory(categoriaParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  let filtered = [...products];

  if (selectedCategory !== 'all') {
    filtered = filtered.filter((p) => p.category && normalize(p.category) === normalize(selectedCategory));
  }
  if (selectedBrand !== 'all') {
    filtered = filtered.filter((p) => p.brand === selectedBrand);
  }

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

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
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-[#eae7e0]">
          <div className="flex items-center gap-2 text-[10px] font-medium text-[#aaaaaa] uppercase tracking-[2.5px]">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} /> Filtrar:
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px] rounded-none text-xs border-[#eae7e0]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[160px] rounded-none text-xs border-[#eae7e0]">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] rounded-none text-xs border-[#eae7e0]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destaques</SelectItem>
              <SelectItem value="price-asc">Menor preço</SelectItem>
              <SelectItem value="price-desc">Maior preço</SelectItem>
              <SelectItem value="rating">Melhor avaliação</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] text-[#aaaaaa] ml-auto uppercase tracking-[2.5px]">
            {loading ? '...' : `${filtered.length} produtos`}
          </span>
        </div>

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
              onClick={() => { setSelectedCategory('all'); setSelectedBrand('all'); }}
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
