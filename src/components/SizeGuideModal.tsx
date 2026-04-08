import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BRANDS = ['Nike', 'Adidas', 'Puma', 'New Balance'] as const;
type Brand = (typeof BRANDS)[number];

const COLUMNS = ['BR', 'EU', 'UK', 'US', 'CM'] as const;

const SIZE_DATA: Record<Brand, string[][]> = {
  Nike: [
    ['37', '37.5', '4.5', '5', '23.5'],
    ['38', '38.5', '5.5', '6', '24.0'],
    ['39', '39', '6', '6.5', '24.5'],
    ['40', '40', '7', '7.5', '25.5'],
    ['41', '41', '7.5', '8', '26.0'],
    ['42', '42', '8', '8.5', '26.5'],
    ['43', '43', '9', '9.5', '27.5'],
    ['44', '44', '9.5', '10', '28.0'],
  ],
  Adidas: [
    ['37', '37', '4', '4.5', '23.0'],
    ['38', '38', '5', '5.5', '24.0'],
    ['39', '39', '6', '6.5', '24.5'],
    ['40', '40', '6.5', '7', '25.0'],
    ['41', '41', '7.5', '8', '26.0'],
    ['42', '42', '8', '8.5', '26.5'],
    ['43', '43', '9', '9.5', '27.0'],
    ['44', '44', '9.5', '10', '28.0'],
  ],
  Puma: [
    ['37', '37', '4', '5', '23.5'],
    ['38', '38', '5', '6', '24.0'],
    ['39', '39', '6', '7', '24.5'],
    ['40', '40', '6.5', '7.5', '25.5'],
    ['41', '41', '7.5', '8.5', '26.0'],
    ['42', '42', '8', '9', '26.5'],
    ['43', '43', '9', '10', '27.5'],
    ['44', '44', '9.5', '10.5', '28.0'],
  ],
  'New Balance': [
    ['37', '37', '4', '4.5', '23.5'],
    ['38', '38', '5', '5.5', '24.0'],
    ['39', '39', '5.5', '6', '24.5'],
    ['40', '40', '6.5', '7', '25.5'],
    ['41', '41', '7', '7.5', '26.0'],
    ['42', '42', '8', '8.5', '26.5'],
    ['43', '43', '9', '9.5', '27.5'],
    ['44', '44', '9.5', '10', '28.0'],
  ],
};

const STEPS = [
  { icon: '📏', text: 'Coloque o pé sobre uma folha de papel e marque o calcanhar e o dedo mais longo' },
  { icon: '✏️', text: 'Meça a distância entre os dois pontos em centímetros' },
  { icon: '👟', text: 'Compare com a tabela acima e escolha o tamanho correspondente' },
];

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  initialBrand?: string;
}

const SizeGuideModal = ({ open, onClose, initialBrand }: SizeGuideModalProps) => {
  const [activeTab, setActiveTab] = useState<Brand>('Nike');

  useEffect(() => {
    if (open && initialBrand) {
      const match = BRANDS.find(
        (b) => b.toLowerCase() === initialBrand.toLowerCase()
      );
      if (match) setActiveTab(match);
    }
  }, [open, initialBrand]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const rows = SIZE_DATA[activeTab];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white w-full max-w-[700px] max-h-[80vh] overflow-y-auto rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-5 border-b border-[#eae7e0]">
              <h2 className="text-sm font-bold text-[#1A2F23] uppercase tracking-[3px]">
                Guia de Tamanhos
              </h2>
              <button
                onClick={onClose}
                className="text-[#aaaaaa] hover:text-[#1A2F23] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#eae7e0] px-6">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setActiveTab(brand)}
                  className={`py-3 px-4 text-xs font-medium tracking-wide transition-colors relative ${
                    activeTab === brand
                      ? 'text-[#1A2F23]'
                      : 'text-[#aaaaaa] hover:text-[#1A2F23]'
                  }`}
                >
                  {brand}
                  {activeTab === brand && (
                    <motion.div
                      layoutId="sizeGuideTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A2F23]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="px-6 py-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1A2F23] text-white">
                    {COLUMNS.map((col) => (
                      <th
                        key={col}
                        className="py-3 px-4 text-xs font-semibold tracking-wider text-center"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? 'bg-[#f8f7f4]' : 'bg-white'}
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="py-2.5 px-4 text-center text-[#1A2F23] text-xs"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How to measure */}
            <div className="px-6 pb-2">
              <h3 className="text-xs font-bold text-[#1A2F23] uppercase tracking-[2px] mb-4">
                Como medir seu pé
              </h3>
              <div className="space-y-3">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">{step.icon}</span>
                    <p className="text-xs text-[#666] leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <div className="px-6 py-5 border-t border-[#eae7e0] mt-4">
              <p className="text-[10px] text-[#aaaaaa] text-center tracking-wide">
                Medidas em centímetros. Em caso de dúvida, recomendamos escolher o tamanho maior.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SizeGuideModal;
