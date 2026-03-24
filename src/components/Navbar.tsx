import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, Package, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Até logo!');
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <nav className={cn(
      "sticky top-0 left-0 right-0 z-50 bg-[#f8f7f4] border-b border-[#eae7e0] transition-shadow duration-300",
      scrolled ? "shadow-sm" : "shadow-none"
    )}>
      <div className="container mx-auto px-4 h-[70px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-lg font-bold tracking-[8px] text-[#1A2F23] uppercase">
          NOVANT
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] opacity-60 hover:opacity-100 transition-opacity duration-300">Home</Link>
          <Link to="/catalogo" className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] opacity-60 hover:opacity-100 transition-opacity duration-300">Catálogo</Link>
          <Link to="/destaques" className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] opacity-60 hover:opacity-100 transition-opacity duration-300">Destaques</Link>
          <Link to="/contato" className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] opacity-60 hover:opacity-100 transition-opacity duration-300">Contato</Link>
        </div>

        {/* Right icons */}
        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-[#1A2F23] opacity-55 hover:opacity-100 hover:bg-transparent">
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#1A2F23] opacity-55 hover:opacity-100 hover:bg-transparent">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#1A2F23] opacity-55 hover:opacity-100 hover:bg-transparent relative" onClick={openCart}>
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-[#1A2F23] text-white text-[9px] font-bold rounded-full">
                {totalItems}
              </span>
            )}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#1A2F23] opacity-55 hover:opacity-100 hover:bg-transparent">
                  <div className="h-7 w-7 bg-[#1A2F23] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#E8E3DA]">
                      {(displayName || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-none">
                <div className="px-2 py-1.5 text-[10px] text-[#aaaaaa] uppercase tracking-wider truncate">
                  {displayName}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast('Em breve!')} className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <UserCircle className="h-4 w-4" /> Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast('Em breve!')} className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Package className="h-4 w-4" /> Meus Pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-xs uppercase tracking-wider text-destructive">
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="text-[#1A2F23] opacity-55 hover:opacity-100 hover:bg-transparent" onClick={() => setAuthModalOpen(true)}>
              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button variant="ghost" size="icon" className="md:hidden text-[#1A2F23]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[70px] bg-[#f8f7f4] z-40">
          <div className="flex flex-col p-8 gap-6">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] py-3 border-b border-[#eae7e0]">Home</Link>
            <Link to="/catalogo" onClick={() => setMobileOpen(false)} className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] py-3 border-b border-[#eae7e0]">Catálogo</Link>
            <Link to="/destaques" onClick={() => setMobileOpen(false)} className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] py-3 border-b border-[#eae7e0]">Destaques</Link>
            <Link to="/contato" onClick={() => setMobileOpen(false)} className="text-[10px] font-normal uppercase tracking-[2.5px] text-[#1A2F23] py-3 border-b border-[#eae7e0]">Contato</Link>
            <div className="flex items-center gap-5 pt-4">
              <Search className="h-5 w-5 text-[#1A2F23] opacity-55" strokeWidth={1.5} />
              <Heart className="h-5 w-5 text-[#1A2F23] opacity-55" strokeWidth={1.5} />
              <button onClick={() => { setMobileOpen(false); openCart(); }} className="relative">
                <ShoppingBag className="h-5 w-5 text-[#1A2F23] opacity-55" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center bg-[#1A2F23] text-white text-[9px] font-bold rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              {user ? (
                <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="ml-auto text-[10px] uppercase tracking-[2.5px] text-destructive font-medium">Sair</button>
              ) : (
                <button onClick={() => { setMobileOpen(false); setAuthModalOpen(true); }} className="ml-auto text-[10px] uppercase tracking-[2.5px] text-[#1A2F23] font-medium">Entrar</button>
              )}
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
