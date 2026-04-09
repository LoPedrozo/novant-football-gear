import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { resolveProductImage } from '@/lib/productImages';

interface Suggestion {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string | null;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

interface SearchBarProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const SearchBar = ({ open, onOpen, onClose }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, brand, price, image_url')
      .or(`name.ilike.%${term}%,brand.ilike.%${term}%`)
      .limit(5);
    setSuggestions(data || []);
    setLoading(false);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && query.trim()) {
      navigate(`/catalogo?busca=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSelect = (id: string) => {
    navigate(`/produto/${id}`);
    onClose();
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Search icon button (always visible) */}
      <button
        onClick={() => (open ? onClose() : onOpen())}
        className="text-[#1A2F23] opacity-55 hover:opacity-100 transition-opacity h-9 w-9 flex items-center justify-center"
      >
        {open ? (
          <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
        ) : (
          <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
        )}
      </button>

      {/* Expanding search input */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar produtos..."
              className="w-[300px] h-9 bg-transparent border-b border-[#1A2F23]/20 text-xs text-[#1A2F23] placeholder:text-[#aaaaaa] outline-none px-2 focus:border-[#1A2F23]/50 transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (query.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 w-[340px] bg-white shadow-lg border border-[#eae7e0] rounded-none z-50 mt-1"
          >
            {loading ? (
              <div className="p-4 text-center text-[10px] text-[#aaaaaa] uppercase tracking-wider">
                Buscando...
              </div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => handleSelect(s.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f8f7f4] transition-colors border-b border-[#eae7e0] last:border-b-0"
                  >
                    <img
                      src={resolveProductImage(s.image_url)}
                      alt={s.name}
                      className="w-10 h-10 object-cover flex-shrink-0 bg-[#f2efea]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#1A2F23] leading-tight truncate">
                        {highlightMatch(s.name, query)}
                      </p>
                      <p className="text-[10px] text-[#aaaaaa] uppercase tracking-wider">
                        {highlightMatch(s.brand, query)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#1A2F23] flex-shrink-0">
                      R$ {s.price.toFixed(2).replace('.', ',')}
                    </span>
                  </li>
                ))}
                {query.trim() && (
                  <li
                    onClick={() => { navigate(`/catalogo?busca=${encodeURIComponent(query.trim())}`); onClose(); }}
                    className="px-4 py-3 text-center text-[10px] text-[#7BAF8E] uppercase tracking-wider cursor-pointer hover:bg-[#f8f7f4] transition-colors font-medium"
                  >
                    Ver todos os resultados para &quot;{query}&quot;
                  </li>
                )}
              </ul>
            ) : (
              <div className="p-4 text-center text-[10px] text-[#aaaaaa] uppercase tracking-wider">
                Nenhum resultado para &quot;{query}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
