import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center mb-16">
    <h2 className="text-[10px] font-extrabold text-[#aaaaaa] uppercase tracking-[5px]">
      {children}
    </h2>
  </div>
);

/* SVG football field in perspective — decorative background for the hero */
const FootballField = () => (
  <div
    className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
    style={{ perspective: '800px' }}
  >
    <svg
      viewBox="0 0 680 1050"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[500px] md:w-[680px] h-auto"
      style={{
        transform: 'rotateX(55deg) rotateZ(-15deg)',
        opacity: 1,
      }}
    >
      <rect x="40" y="40" width="600" height="970" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <line x1="40" y1="525" x2="640" y2="525" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <circle cx="340" cy="525" r="91.5" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <circle cx="340" cy="525" r="3" fill="rgba(232,227,218,0.03)" />
      <rect x="148" y="40" width="384" height="165" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <rect x="228" y="40" width="224" height="55" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <path d="M 268 205 A 91.5 91.5 0 0 0 412 205" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <circle cx="340" cy="160" r="3" fill="rgba(232,227,218,0.03)" />
      <rect x="148" y="845" width="384" height="165" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <rect x="228" y="955" width="224" height="55" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <path d="M 268 845 A 91.5 91.5 0 0 1 412 845" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <circle cx="340" cy="890" r="3" fill="rgba(232,227,218,0.03)" />
      <path d="M 40 52 A 12 12 0 0 0 52 40" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <path d="M 628 40 A 12 12 0 0 0 640 52" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <path d="M 40 998 A 12 12 0 0 1 52 1010" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
      <path d="M 628 1010 A 12 12 0 0 1 640 998" stroke="rgba(232,227,218,0.03)" strokeWidth="2" />
    </svg>
  </div>
);

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').eq('featured', true).limit(8);
      if (data) setFeaturedProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1A2F23]">
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,175,142,0.08), transparent 45%)' }} />
        <FootballField />
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-7xl font-extrabold tracking-[16px] text-[#E8E3DA] uppercase"
          >
            NOVANT
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-9 h-[1.5px] bg-[#7BAF8E] mx-auto my-5"
          />
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-light tracking-[7px] uppercase text-[#E8E3DA]/50"
          >
            Every Minute Counts
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <Link to="/catalogo">
              <button className="border border-[#E8E3DA]/10 text-[#E8E3DA] text-[10px] tracking-[4px] uppercase font-medium px-10 py-3 rounded-none bg-transparent hover:border-[#7BAF8E] hover:text-[#7BAF8E] transition-all duration-300">
                Explorar Catálogo
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-[#f8f7f4]">
        <div className="container mx-auto px-4">
          <SectionTitle>Categorias</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative aspect-[3/4] overflow-hidden cursor-pointer rounded-lg"
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-[#1A2F23]/40 group-hover:bg-[#1A2F23]/60 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-end p-5">
                  <h3 className="text-white font-bold text-sm uppercase tracking-[3px]">{cat.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products / Launches */}
      <section className="py-20 bg-[#f8f7f4]">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-[10px] font-extrabold text-[#aaaaaa] uppercase tracking-[5px]">
                Lançamentos
              </h2>
            </div>
            <Link to="/catalogo" className="text-[10px] font-normal text-[#1A2F23] opacity-40 hover:opacity-100 uppercase tracking-[2.5px] flex items-center gap-1 transition-opacity duration-300">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#7BAF8E]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nossa História */}
      <section id="nossa-historia" className="py-24 bg-[#f8f7f4]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-12 md:gap-16 items-center"
          >
            {/* Left: Text */}
            <div className="border-l-[3px] border-[#7BAF8E] pl-8">
              <p className="text-[9px] font-extrabold text-[#7BAF8E] uppercase tracking-[5px] italic mb-2">
                Do apito inicial ao último minuto
              </p>
              <h2 className="text-2xl font-extrabold text-[#1A2F23] uppercase tracking-[6px] mb-8">
                NOSSA HISTÓRIA
              </h2>
              <div className="flex flex-col gap-4 text-sm text-[#333] leading-relaxed">
                <p>
                  A Novant nasceu de uma obsessão simples: os 90 minutos mais intensos do esporte.
                </p>
                <p>
                  O nome vem do italiano <em>novanta</em> — noventa — uma homenagem a cada segundo que separa o começo do fim, a tentativa da conquista, o esforço do resultado.
                </p>
                <p>
                  Fundada em Curitiba em 2026, a Novant surgiu da frustração de um grupo de jogadores amadores que não encontravam, no mercado brasileiro, chuteiras que unissem performance real e identidade visual. Eram produtos genéricos demais, caros demais ou inacessíveis demais.
                </p>
                <p>
                  A resposta foi criar uma curadoria diferente: selecionar apenas o que realmente importa dentro de campo. Sem exageros, sem promessas vazias. Apenas equipamento feito para quem joga de verdade — seja no gramado molhado de domingo ou na quadra de sexta à noite.
                </p>
                <p>
                  Hoje, a Novant representa quatro das maiores marcas do futebol mundial e atende jogadores de todo o Brasil. Mas a obsessão continua a mesma: fazer cada minuto em campo valer a pena.
                </p>
              </div>
              <p className="mt-8 text-base font-bold text-[#1A2F23] italic">
                "Every Minute Counts."
              </p>
            </div>

            {/* Right: Decorative "90" + stat cards */}
            <div className="relative flex items-center justify-center min-h-[320px]">
              {/* Large "90" decorative */}
              <span
                className="absolute select-none font-extrabold text-[#1A2F23] leading-none"
                style={{ fontSize: 'clamp(180px, 22vw, 260px)', opacity: 0.07 }}
                aria-hidden="true"
              >
                90
              </span>

              {/* Stat cards */}
              <div className="relative z-10 flex flex-col gap-4 w-full max-w-[220px]">
                {[
                  { value: '4', label: 'Marcas Parceiras', delay: 0.1 },
                  { value: '12+', label: 'Produtos Selecionados', delay: 0.2 },
                  { value: '2026', label: 'Fundada em', delay: 0.3 },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: stat.delay, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-none shadow-sm px-6 py-4"
                  >
                    <p className="text-3xl font-extrabold text-[#1A2F23] leading-none">{stat.value}</p>
                    <p className="text-[9px] uppercase tracking-[3px] text-gray-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 bg-[#f8f7f4]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-sm font-semibold text-[#1A2F23]/30 uppercase tracking-[5px] text-center mb-10">
            Nossas Marcas
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-16 md:gap-20">
            {[
              { name: 'Nike', slug: 'nike' },
              { name: 'Adidas', slug: 'adidas' },
              { name: 'Puma', slug: 'puma' },
              { name: 'New Balance', slug: 'newbalance' },
            ].map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center justify-center cursor-pointer opacity-40 hover:opacity-70 transition-opacity duration-300"
              >
                <img
                  src={`https://cdn.simpleicons.org/${brand.slug}/1A2F23`}
                  alt={brand.name}
                  className="h-12 md:h-14 w-auto object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
