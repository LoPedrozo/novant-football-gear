import { Link } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { products, categories, brands } from '@/lib/mockData';
import heroBg from '@/assets/hero-bg.jpg';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center mb-16">
    <h2 className="text-2xl font-extrabold text-foreground uppercase tracking-[0.15em]">
      {children}
    </h2>
    <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
  </div>
);

const Index = () => {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Chuteiras de futebol" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.25em] text-card uppercase mb-6"
          >
            NOVANT
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-card/70 font-light tracking-widest mb-10"
          >
            Equipamento para os 90 minutos
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/catalogo">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold uppercase tracking-[0.2em] px-10 py-6 rounded-none">
                Ver Catálogo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
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
                className="group relative aspect-[3/4] overflow-hidden cursor-pointer"
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/55 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-end p-5">
                  <h3 className="text-card font-bold text-sm uppercase tracking-[0.12em]">{cat.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground uppercase tracking-[0.15em]">
                Lançamentos
              </h2>
              <div className="w-16 h-0.5 bg-primary mt-4" />
            </div>
            <Link to="/catalogo" className="text-[11px] font-medium text-primary hover:text-primary-hover uppercase tracking-[0.15em] flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
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
      <section className="bg-primary py-5">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-primary-foreground">
          <Truck className="h-5 w-5" strokeWidth={1.5} />
          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em]">
            Frete grátis em compras acima de R$ 299,00
          </p>
        </div>
      </section>

      {/* Brands */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionTitle>Nossas Marcas</SectionTitle>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {brands.map((brand, i) => (
              <motion.span
                key={brand}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-2xl md:text-3xl font-black text-muted-foreground/30 hover:text-foreground transition-colors duration-500 cursor-pointer tracking-[0.15em] uppercase select-none"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
