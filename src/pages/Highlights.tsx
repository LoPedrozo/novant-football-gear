import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { resolveProductImage } from '@/lib/productImages';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const PRODUCT_NAMES = [
  'Nike Phantom Luna II Elite FG',
  'Adidas Predator League FG',
  'New Balance Furon v7+ Pro',
];

function getTagline(description: string | null | undefined): string {
  if (!description) return '';
  const lines = description.split('\n').filter((l) => l.trim() !== '');
  return lines[0] ?? '';
}

function calcDiscount(price: number, original: number): number {
  return Math.round(((original - price) / original) * 100);
}

const stagger = (base: number, i: number) => base + i * 0.1;

const Highlights = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();
  const { scrollYProgress } = useScroll();
  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, brand, price, original_price, description, image_url')
        .in('name', PRODUCT_NAMES);

      if (data) {
        const ordered = PRODUCT_NAMES.map(
          (name) => data.find((p) => p.name === name)
        ).filter(Boolean);
        setProducts(ordered);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image_url: resolveProductImage(product.image_url),
      price: product.price,
      size: '',
      color: '',
      quantity: 1,
    });
    toast.success('Produto adicionado ao carrinho!');
    openCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A2F23]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7BAF8E]" />
      </div>
    );
  }

  const total = products.length;

  return (
    <div className="snap-y snap-mandatory overflow-y-auto h-screen" style={{ scrollBehavior: 'smooth' }}>
      {/* Scroll progress indicator */}
      <div className="fixed right-8 top-0 w-[2px] h-screen z-50 bg-white/10">
        <motion.div
          className="w-full bg-[#7BAF8E] origin-top"
          style={{ height: progressHeight }}
        />
      </div>

      {/* ── Section 1 — Hero ── */}
      <section className="relative h-screen flex flex-col items-center justify-center bg-[#1A2F23] snap-start overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div className="w-48 h-[1px] bg-white/20 mb-10" />
          <h1 className="text-6xl md:text-8xl font-black tracking-widest text-white uppercase text-center">
            DESTAQUES
          </h1>
          <div className="w-48 h-[1px] bg-white/20 mt-10 mb-6" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/60 text-xl italic"
          >
            Temporada 2026 — Os escolhidos
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-6 w-6 text-white" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Sections 2–4 — Product Covers ── */}
      {products.map((product, i) => {
        const tagline = getTagline(product.description);
        const hasDiscount = product.original_price && product.original_price > product.price;
        const discount = hasDiscount ? calcDiscount(product.price, product.original_price) : 0;
        const num = String(i + 1).padStart(2, '0');

        return (
          <section
            key={product.id}
            className="relative h-screen snap-start overflow-hidden"
          >
            {/* Background image */}
            <img
              src={resolveProductImage(product.image_url)}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
              }}
            />

            {/* Right side large number */}
            <div className="absolute right-6 md:right-16 bottom-16 select-none pointer-events-none">
              <span
                className="text-white/10 text-[12rem] md:text-[16rem] font-black leading-none"
                style={{ writingMode: 'vertical-rl' }}
              >
                {num}
              </span>
            </div>

            {/* Bottom text block */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 p-6 md:p-16 z-10"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: stagger(0, 0) }}
                className="text-white/40 text-sm tracking-widest uppercase font-mono mb-3"
              >
                {num} / {String(total).padStart(2, '0')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: stagger(0, 1) }}
                className="text-[#7BAF8E] uppercase tracking-widest text-sm font-medium mb-2"
              >
                {product.brand}
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: stagger(0, 2) }}
                className="text-3xl md:text-6xl font-black text-white leading-tight max-w-[90%] md:max-w-[60%] mb-4"
              >
                {product.name}
              </motion.h2>

              {tagline && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: stagger(0, 3) }}
                  className="text-white/70 text-lg max-w-[90%] md:max-w-[50%] mt-4 mb-6"
                >
                  {tagline}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: stagger(0, 4) }}
                className="flex items-center gap-4 mb-8"
              >
                <span className="text-white text-3xl font-bold">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-white/40 line-through text-xl">
                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="bg-[#7BAF8E] text-white text-sm px-2 py-1">
                      -{discount}%
                    </span>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: stagger(0, 5) }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to={`/produto/${product.id}`}>
                  <button className="bg-white text-[#1A2F23] rounded-none px-8 py-3 font-medium uppercase tracking-wide text-sm hover:bg-white/90 transition-colors">
                    VER PRODUTO
                  </button>
                </Link>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="border border-white text-white rounded-none px-8 py-3 font-medium uppercase tracking-wide text-sm hover:bg-white/10 transition-colors"
                >
                  ADICIONAR AO CARRINHO
                </button>
              </motion.div>
            </motion.div>
          </section>
        );
      })}

      {/* ── Section 5 — CTA ── */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center bg-[#1A2F23] snap-start px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#7BAF8E] uppercase tracking-widest text-sm mb-6"
          >
            NOVANT — EVERY MINUTE COUNTS
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white"
          >
            Explore o Cat&aacute;logo
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-xl mt-4"
          >
            12 produtos. 4 marcas. Tudo que voc&ecirc; precisa em campo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/catalogo">
              <button className="mt-10 bg-white text-[#1A2F23] rounded-none px-12 py-4 text-lg font-medium uppercase tracking-wide hover:bg-white/90 transition-colors">
                VER TODOS OS PRODUTOS
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Highlights;
