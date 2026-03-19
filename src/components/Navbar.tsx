import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, Package, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b transition-shadow duration-300",
      scrolled ? "shadow-md" : "shadow-none"
    )}>
      <div className="container mx-auto px-4 h-[70px] flex items-center justify-between">
        <Link to="/" className="text-xl font-black tracking-[0.2em] text-primary uppercase">
          NOVANT
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground">Home</Link>
          <Link to="/catalogo" className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground">Catálogo</Link>
          <Link to="/sobre" className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground">Sobre Nós</Link>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[9px] font-bold h-4 w-4 flex items-center justify-center">0</span>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <div className="h-7 w-7 bg-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-foreground">
                      {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <UserCircle className="h-4 w-4" /> Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Package className="h-4 w-4" /> Meus Pedidos
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Heart className="h-4 w-4" /> Favoritos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-xs uppercase tracking-wider text-destructive">
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Button>
            </Link>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[70px] bg-card z-40 animate-in slide-in-from-right">
          <div className="flex flex-col p-8 gap-6">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium uppercase tracking-[0.15em] text-foreground py-2 border-b border-border">Home</Link>
            <Link to="/catalogo" onClick={() => setMobileOpen(false)} className="text-sm font-medium uppercase tracking-[0.15em] text-foreground py-2 border-b border-border">Catálogo</Link>
            <Link to="/sobre" onClick={() => setMobileOpen(false)} className="text-sm font-medium uppercase tracking-[0.15em] text-foreground py-2 border-b border-border">Sobre Nós</Link>
            <div className="flex items-center gap-4 pt-4">
              <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <Heart className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <ShoppingBag className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              {user ? (
                <button onClick={handleSignOut} className="ml-auto text-xs uppercase tracking-wider text-destructive font-medium">Sair</button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="ml-auto text-xs uppercase tracking-wider text-primary font-medium">Entrar</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
