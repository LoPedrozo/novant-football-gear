import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-[#1A2F23]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-[#E8E3DA] font-bold tracking-[10px] text-lg uppercase mb-4">NOVANT</h3>
            <p className="text-xs text-[#E8E3DA]/25 font-light leading-relaxed">
              Every Minute Counts. A melhor seleção de chuteiras e artigos de futebol do Brasil.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[9px] font-medium tracking-[4px] uppercase text-[#7BAF8E] mb-5">Navegação</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-xs text-[#E8E3DA]/25 font-light hover:text-[#E8E3DA]/60 transition-colors duration-300">Home</Link>
              <Link to="/catalogo" className="text-xs text-[#E8E3DA]/25 font-light hover:text-[#E8E3DA]/60 transition-colors duration-300">Catálogo</Link>
              <Link to="/contato" className="text-xs text-[#E8E3DA]/25 font-light hover:text-[#E8E3DA]/60 transition-colors duration-300">Contato</Link>
              <a href="/#nossa-historia" className="text-xs text-[#E8E3DA]/25 font-light hover:text-[#E8E3DA]/60 transition-colors duration-300">Sobre</a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[9px] font-medium tracking-[4px] uppercase text-[#7BAF8E] mb-5">Suporte</h4>
            <div className="flex flex-col gap-3">
              <Link to="/trocas" className="text-xs text-[#E8E3DA]/25 font-light hover:text-[#E8E3DA]/60 transition-colors duration-300">Trocas e Devoluções</Link>
              <Link to="/privacidade" className="text-xs text-[#E8E3DA]/25 font-light hover:text-[#E8E3DA]/60 transition-colors duration-300">Política de Privacidade</Link>
              <Link to="/termos" className="text-xs text-[#E8E3DA]/25 font-light hover:text-[#E8E3DA]/60 transition-colors duration-300">Termos de Uso</Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[9px] font-medium tracking-[4px] uppercase text-[#7BAF8E] mb-5">Social</h4>
            <div className="flex items-center gap-5">
              <a href="https://instagram.com/lo_pedrozo" target="_blank" rel="noopener noreferrer" className="text-[#E8E3DA]/25 hover:text-[#7BAF8E] transition-colors duration-300"><Instagram className="h-5 w-5" strokeWidth={1.5} /></a>
              <a href="https://instagram.com/lo_pedrozo" target="_blank" rel="noopener noreferrer" className="text-[#E8E3DA]/25 hover:text-[#7BAF8E] transition-colors duration-300"><Facebook className="h-5 w-5" strokeWidth={1.5} /></a>
              <a href="https://instagram.com/lo_pedrozo" target="_blank" rel="noopener noreferrer" className="text-[#E8E3DA]/25 hover:text-[#7BAF8E] transition-colors duration-300"><Twitter className="h-5 w-5" strokeWidth={1.5} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E3DA]/5 mt-12 pt-8 text-center">
          <p className="text-[10px] text-[#E8E3DA]/15 uppercase tracking-[3px] font-light">
            &copy; 2026 Novant. Every Minute Counts.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
