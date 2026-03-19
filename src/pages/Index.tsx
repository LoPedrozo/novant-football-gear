import { Link } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { products, categories, brands } from '@/lib/mockData';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Chuteiras de futebol" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-wider text-background mb-4 animate-fade-in">
            NOVANT
          </h1>
          <p className="text-lg md:text-xl text-background/80 mb-8 font-light tracking-wide animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Equipamento para os 90 minutos
          </p>
          <Link to="/catalogo">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-accent text-sm font-semibold tracking-wider px-8 py-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              VER CATÁLOGO <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.slug} className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/50 transition-colors" />
                <div className="absolute inset-0 flex items-end p-4">
                  <h3 className="text-background font-bold text-lg">{cat.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-foreground">Lançamentos</h2>
            <Link to="/catalogo" className="text-sm font-medium text-primary hover:text-accent transition-colors flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-primary-foreground">
          <Truck className="h-6 w-6" />
          <p className="text-sm md:text-base font-semibold tracking-wide">
            FRETE GRÁTIS em compras acima de R$ 299,00
          </p>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Nossas Marcas</h2>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {brands.map((brand) => (
              <span key={brand} className="text-2xl md:text-3xl font-black text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer tracking-wider">
                {brand.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
