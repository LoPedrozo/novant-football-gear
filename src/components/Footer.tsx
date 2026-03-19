import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-black tracking-[0.2em] uppercase mb-4">NOVANT</h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Equipamento para os 90 minutos. A melhor seleção de artigos de futebol do Brasil.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 text-primary-foreground/50">Navegação</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Home</Link>
              <Link to="/catalogo" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Catálogo</Link>
              <Link to="/sobre" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Sobre Nós</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 text-primary-foreground/50">Ajuda</h4>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-primary-foreground/60 cursor-pointer hover:text-primary-foreground transition-colors">Trocas e Devoluções</span>
              <span className="text-sm text-primary-foreground/60 cursor-pointer hover:text-primary-foreground transition-colors">Política de Privacidade</span>
              <span className="text-sm text-primary-foreground/60 cursor-pointer hover:text-primary-foreground transition-colors">Termos de Uso</span>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 text-primary-foreground/50">Redes Sociais</h4>
            <div className="flex items-center gap-5">
              <Instagram className="h-5 w-5 text-primary-foreground/50 hover:text-primary-foreground cursor-pointer transition-colors" strokeWidth={1.5} />
              <Facebook className="h-5 w-5 text-primary-foreground/50 hover:text-primary-foreground cursor-pointer transition-colors" strokeWidth={1.5} />
              <Twitter className="h-5 w-5 text-primary-foreground/50 hover:text-primary-foreground cursor-pointer transition-colors" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-[11px] text-primary-foreground/40 uppercase tracking-[0.1em]">© 2026 Novant. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
