import { Shield, Award, Heart } from 'lucide-react';

const values = [
  { icon: Shield, title: 'Qualidade', description: 'Produtos selecionados das melhores marcas mundiais, com garantia de autenticidade.' },
  { icon: Award, title: 'Autenticidade', description: 'Todos os nossos produtos são 100% originais, adquiridos diretamente dos fabricantes.' },
  { icon: Heart, title: 'Paixão', description: 'Somos movidos pela paixão pelo futebol e levamos essa energia para cada detalhe.' },
];

const About = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-primary-foreground tracking-wider mb-4">
            Nossa História
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Conheça a marca que vive cada minuto do futebol
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-lg text-muted-foreground leading-relaxed text-center">
            A Novant nasceu da paixão pelo futebol e pela cultura que cerca os 90 minutos mais intensos do esporte. 
            Nosso nome vem do italiano <em className="text-foreground font-semibold">"novanta"</em> — noventa — uma homenagem 
            a cada minuto de dedicação dentro e fora de campo. Acreditamos que o equipamento certo faz toda a diferença, 
            por isso selecionamos os melhores produtos das maiores marcas do mundo para equipar jogadores de todos os níveis.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-background rounded-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
