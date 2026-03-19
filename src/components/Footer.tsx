import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-black tracking-wider mb-4">NOVANT</h3>
            <p className="text-sm opacity-70">
              Equipamento para os 90 minutos. A melhor seleção de artigos de futebol do Brasil.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-70">Navegação</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Home</Link>
              <Link to="/catalogo" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Catálogo</Link>
              <Link to="/sobre" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Sobre Nós</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-70">Ajuda</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm opacity-70">Trocas e Devoluções</span>
              <span className="text-sm opacity-70">Política de Privacidade</span>
              <span className="text-sm opacity-70">Termos de Uso</span>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-70">Redes Sociais</h4>
            <div className="flex items-center gap-4">
              <Instagram className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
              <Facebook className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
              <Twitter className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-sm opacity-50">© 2026 Novant. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
