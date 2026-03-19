import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-wider text-foreground">
          NOVANT
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/catalogo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Catálogo
          </Link>
          <Link to="/sobre" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sobre Nós
          </Link>
        </div>

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </Button>
          <Link to="/login">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">
              Home
            </Link>
            <Link to="/catalogo" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">
              Catálogo
            </Link>
            <Link to="/sobre" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">
              Sobre Nós
            </Link>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">0</span>
              </Button>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
