import { Link } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { products, categories, brands } from '@/lib/mockData';
import umbroLogo from '@/assets/brands/umbro-logo.png';

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
      {/* Outer rectangle */}
      <rect x="40" y="40" width="600" height="970" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Center line */}
      <line x1="40" y1="525" x2="640" y2="525" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Center circle */}
      <circle cx="340" cy="525" r="91.5" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Center dot */}
      <circle cx="340" cy="525" r="3" fill="rgba(232,227,218,0.05)" />
      {/* Top penalty area */}
      <rect x="148" y="40" width="384" height="165" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Top goal area */}
      <rect x="228" y="40" width="224" height="55" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Top penalty arc */}
      <path d="M 268 205 A 91.5 91.5 0 0 0 412 205" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Top penalty dot */}
      <circle cx="340" cy="160" r="3" fill="rgba(232,227,218,0.05)" />
      {/* Bottom penalty area */}
      <rect x="148" y="845" width="384" height="165" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Bottom goal area */}
      <rect x="228" y="955" width="224" height="55" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Bottom penalty arc */}
      <path d="M 268 845 A 91.5 91.5 0 0 1 412 845" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      {/* Bottom penalty dot */}
      <circle cx="340" cy="890" r="3" fill="rgba(232,227,218,0.05)" />
      {/* Corner arcs */}
      <path d="M 40 52 A 12 12 0 0 0 52 40" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      <path d="M 628 40 A 12 12 0 0 0 640 52" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      <path d="M 40 998 A 12 12 0 0 1 52 1010" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
      <path d="M 628 1010 A 12 12 0 0 1 640 998" stroke="rgba(232,227,218,0.05)" strokeWidth="2" />
    </svg>
  </div>
);

const Index = () => {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1A2F23]">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,175,142,0.08), transparent 45%)' }} />

        {/* Football field background */}
        <FootballField />

        {/* Hero content */}
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
            className="text-xs font-light tracking-[7px] uppercase text-[#E8E3DA]/30"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {featuredProducts.slice(0, 8).map((product, i) => (
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
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-[#1A2F23] py-4">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <Truck className="h-4 w-4 text-[#E8E3DA]" strokeWidth={1.5} />
          <p className="text-[10px] text-[#E8E3DA] font-medium uppercase tracking-[4px]">
            Frete grátis acima de R$299
          </p>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-[#f8f7f4]">
        <div className="container mx-auto px-4">
          <SectionTitle>Nossas Marcas</SectionTitle>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {[
              { name: 'Nike', slug: 'nike', custom: null },
              { name: 'Adidas', slug: 'adidas', custom: null },
              { name: 'Puma', slug: 'puma', custom: null },
              { name: 'New Balance', slug: 'newbalance', custom: null },
              { name: 'Umbro', slug: 'umbro', custom: umbroLogo },
            ].map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="cursor-pointer opacity-20 hover:opacity-70 transition-opacity duration-500"
              >
                <img
                  src={brand.custom || `https://cdn.simpleicons.org/${brand.slug}/1A2F23`}
                  alt={brand.name}
                  className="h-8 md:h-10 w-auto"
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
