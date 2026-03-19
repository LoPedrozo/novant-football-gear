import { Shield, Award, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  { icon: Shield, title: 'Qualidade', description: 'Produtos selecionados das melhores marcas mundiais, com garantia de autenticidade.' },
  { icon: Award, title: 'Autenticidade', description: 'Todos os nossos produtos são 100% originais, adquiridos diretamente dos fabricantes.' },
  { icon: Heart, title: 'Paixão', description: 'Somos movidos pela paixão pelo futebol e levamos essa energia para cada detalhe.' },
];

const About = () => {
  return (
    <div className="min-h-screen pt-[70px]">
      {/* Hero */}
      <section className="bg-primary py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-5xl font-extrabold text-primary-foreground uppercase tracking-[0.2em] mb-4"
          >
            Nossa História
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-primary-foreground/60 font-light tracking-wider"
          >
            Conheça a marca que vive cada minuto do futebol
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-base text-muted-foreground leading-[1.9] text-center"
          >
            A Novant nasceu da paixão pelo futebol e pela cultura que cerca os 90 minutos mais intensos do esporte. 
            Nosso nome vem do italiano <em className="text-foreground font-semibold not-italic">"novanta"</em> — noventa — uma homenagem 
            a cada minuto de dedicação dentro e fora de campo. Acreditamos que o equipamento certo faz toda a diferença, 
            por isso selecionamos os melhores produtos das maiores marcas do mundo para equipar jogadores de todos os níveis.
          </motion.p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-foreground uppercase tracking-[0.15em]">Nossos Valores</h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-card p-10 text-center shadow-sm hover:shadow-lg transition-shadow duration-500"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 mb-6">
                  <v.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-[0.1em] mb-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
