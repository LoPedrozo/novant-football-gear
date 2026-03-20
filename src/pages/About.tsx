import { Shield, Award, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  { icon: Shield, title: 'Qualidade', description: 'Produtos selecionados das melhores marcas mundiais, com garantia de autenticidade e desempenho.' },
  { icon: Award, title: 'Autenticidade', description: 'Todos os nossos produtos são 100% originais, adquiridos diretamente dos fabricantes.' },
  { icon: Heart, title: 'Paixão', description: 'Somos movidos pela paixão pelo futebol e levamos essa energia para cada detalhe da experiência.' },
];

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center bg-[#1A2F23] overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,175,142,0.06), transparent 50%)' }} />
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[10px] font-extrabold text-[#E8E3DA] uppercase tracking-[5px] mb-4"
          >
            Nossa História
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-9 h-[1.5px] bg-[#7BAF8E] mx-auto"
          />
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-[#f8f7f4]">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm text-[#aaaaaa] leading-[2] text-center font-normal"
          >
            A Novant nasceu da paixão pelo futebol e pela cultura que cerca os 90 minutos mais intensos do esporte.
            Nosso nome vem do italiano <span className="text-[#1A2F23] font-semibold">"novanta"</span> — noventa — uma homenagem
            a cada minuto de dedicação dentro e fora de campo. Acreditamos que o equipamento certo faz toda a diferença,
            por isso selecionamos os melhores produtos das maiores marcas do mundo para equipar jogadores de todos os níveis.
          </motion.p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#f2efea]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-extrabold text-[#aaaaaa] uppercase tracking-[5px]">Nossos Valores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white border border-[#eae7e0] p-10 text-center rounded-lg hover:border-[#7BAF8E] transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#7BAF8E]/10 mb-6 rounded-lg">
                  <v.icon className="h-6 w-6 text-[#7BAF8E]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[8px] font-semibold text-[#7BAF8E] uppercase tracking-[3px] mb-3">{v.title}</h3>
                <p className="text-xs text-[#aaaaaa] leading-relaxed font-normal">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
