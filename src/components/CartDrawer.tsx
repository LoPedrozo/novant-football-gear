import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Minus, Plus, LogIn } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CartDrawerProps {
  onRequestAuth?: () => void;
}

const CartDrawer = ({ onRequestAuth }: CartDrawerProps) => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart, isOpen, closeCart } = useCart();
  const { user } = useAuth();
  const [showLoginGate, setShowLoginGate] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowLoginGate(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset login gate when user logs in
  useEffect(() => {
    if (user) setShowLoginGate(false);
  }, [user]);

  const formatPrice = (value: number) =>
    `R$ ${value.toFixed(2).replace('.', ',')}`;

  const handleCheckout = () => {
    if (!user) {
      setShowLoginGate(true);
      return;
    }
    toast('Em breve! Funcionalidade em desenvolvimento.');
  };

  const handleRequestAuth = () => {
    if (onRequestAuth) {
      onRequestAuth();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] bg-[#f8f7f4] shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eae7e0]">
          <h2 className="text-[10px] font-extrabold uppercase tracking-[5px] text-[#1A2F23]">
            Carrinho {totalItems > 0 && `(${totalItems})`}
          </h2>
          <button
            onClick={closeCart}
            className="text-[#1A2F23] opacity-55 hover:opacity-100 transition-opacity"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {showLoginGate ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
              <LogIn className="h-12 w-12 text-[#eae7e0]" strokeWidth={1} />
              <p className="text-sm text-[#1A2F23] font-medium leading-relaxed">
                Para finalizar sua compra, você precisa estar logado.
              </p>
              <button
                onClick={handleRequestAuth}
                className="w-full bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:bg-[#1A2F23]/90 transition-colors duration-300"
              >
                Entrar / Cadastrar
              </button>
              <button
                onClick={() => setShowLoginGate(false)}
                className="w-full border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:border-[#7BAF8E] transition-colors duration-300"
              >
                Continuar Comprando
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
              <ShoppingBag className="h-12 w-12 text-[#eae7e0]" strokeWidth={1} />
              <p className="text-sm text-[#aaaaaa] font-normal">Seu carrinho está vazio</p>
              <Link
                to="/catalogo"
                onClick={closeCart}
                className="text-[10px] uppercase tracking-[3px] font-medium text-[#7BAF8E] hover:text-[#1A2F23] transition-colors duration-300"
              >
                Ver Catálogo
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#eae7e0]">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 px-6 py-5">
                  {/* Image */}
                  <div className="w-[60px] h-[60px] flex-shrink-0 bg-[#f2efea] overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-semibold tracking-[2px] uppercase text-[#7BAF8E]">
                      {item.brand}
                    </p>
                    <p className="text-xs font-semibold text-[#1A2F23] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#aaaaaa] mt-0.5">
                      {item.size} · {item.color}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-[#eae7e0]">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center text-[#1A2F23] disabled:opacity-30 hover:bg-[#eae7e0] transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-xs font-medium text-[#1A2F23]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#1A2F23] hover:bg-[#eae7e0] transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-bold text-[#1A2F23]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id, item.size, item.color)}
                    className="self-start text-[#aaaaaa] hover:text-[#1A2F23] transition-colors mt-1"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && !showLoginGate && (
          <div className="border-t border-[#eae7e0] px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[2.5px] font-medium text-[#aaaaaa]">Subtotal</span>
              <span className="text-base font-bold text-[#1A2F23]">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:bg-[#1A2F23]/90 transition-colors duration-300"
            >
              Finalizar Compra
            </button>
            <button
              onClick={closeCart}
              className="w-full border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:border-[#7BAF8E] transition-colors duration-300"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
