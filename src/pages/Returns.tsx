import { motion } from 'framer-motion';
import { MessageCircle, Clock, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    number: '01',
    title: 'Entre em Contato',
    description: 'Fale conosco via WhatsApp ou e-mail informando seu pedido e o motivo da troca.',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    number: '02',
    title: 'Aguarde a Aprovação',
    description: 'Nossa equipe analisará sua solicitação e retornará em até 2 dias úteis.',
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    number: '03',
    title: 'Envie o Produto',
    description: 'Após aprovação, envie o produto. O frete de devolução corre por nossa conta.',
  },
];

const Returns = () => {
  return (
    <>
      <title>Trocas e Devoluções — Novant</title>

      {/* Disclaimer Banner */}
      <div className="w-full bg-[#FFF8E1] py-3 px-6 text-center">
        <p className="text-[10px] text-[#7A5F00] leading-relaxed">
          ⚠️ Este é um projeto fictício criado para fins de portfólio. A Novant não é uma empresa real e as informações abaixo são simuladas para fins educacionais.
        </p>
      </div>

      {/* Hero */}
      <section className="bg-[#1A2F23] py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-[10px] font-medium text-[#7BAF8E] uppercase tracking-[6px] mb-5">Novant</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E8E3DA] uppercase tracking-[5px] mb-5">
            Trocas e Devoluções
          </h1>
          <div className="w-8 h-[1.5px] bg-[#7BAF8E] mx-auto mb-5" />
          <p className="text-[10px] text-[#E8E3DA]/40 uppercase tracking-[3px]">
            Sua satisfação é nossa prioridade
          </p>
        </motion.div>
      </section>

      {/* Prazo para Troca */}
      <section className="bg-[#f8f7f4] py-20 px-6 border-b border-[#1A2F23]/8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[4px] mb-4">
            Prazo para Troca
          </h2>
          <div className="w-6 h-[1.5px] bg-[#7BAF8E] mb-6" />
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#7BAF8E] flex-shrink-0" />
              <span className="text-[11px] text-[#1A2F23]/60 leading-relaxed">
                Você tem até <strong className="text-[#1A2F23]">30 dias</strong> após o recebimento para solicitar a troca ou devolução.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#7BAF8E] flex-shrink-0" />
              <span className="text-[11px] text-[#1A2F23]/60 leading-relaxed">
                O produto deve estar sem uso, com todas as etiquetas originais e na embalagem original.
              </span>
            </li>
          </ul>
        </motion.div>
      </section>

      {/* Como Solicitar — Steps */}
      <section className="bg-[#f8f7f4] py-20 px-6 border-b border-[#1A2F23]/8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[4px] mb-4">
              Como Solicitar
            </h2>
            <div className="w-6 h-[1.5px] bg-[#7BAF8E]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-extrabold text-[#7BAF8E] tracking-[2px]">{step.number}</span>
                  <div className="text-[#1A2F23]">{step.icon}</div>
                </div>
                <h3 className="text-[10px] font-bold text-[#1A2F23] uppercase tracking-[3px] mb-3">
                  {step.title}
                </h3>
                <p className="text-[11px] text-[#1A2F23]/50 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Motivos Aceitos + Reembolso */}
      <section className="bg-[#f8f7f4] py-20 px-6 border-b border-[#1A2F23]/8">
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* Motivos */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[4px] mb-4">
              Motivos Aceitos
            </h2>
            <div className="w-6 h-[1.5px] bg-[#7BAF8E] mb-6" />
            <ul className="space-y-3">
              {['Defeito de fabricação', 'Produto errado enviado', 'Tamanho incorreto'].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#7BAF8E] flex-shrink-0" />
                  <span className="text-[11px] text-[#1A2F23]/60 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Reembolso */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[4px] mb-4">
              Reembolso
            </h2>
            <div className="w-6 h-[1.5px] bg-[#7BAF8E] mb-6" />
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#7BAF8E] flex-shrink-0" />
                <span className="text-[11px] text-[#1A2F23]/60 leading-relaxed">
                  Prazo: até <strong className="text-[#1A2F23]">7 dias úteis</strong> após recebimento do produto devolvido.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#7BAF8E] flex-shrink-0" />
                <span className="text-[11px] text-[#1A2F23]/60 leading-relaxed">
                  Formas: estorno no cartão de crédito ou crédito na loja.
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A2F23] py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          <p className="text-[10px] font-light text-[#E8E3DA]/50 uppercase tracking-[3px] mb-4">
            Precisa de ajuda?
          </p>
          <p className="text-[13px] font-medium text-[#E8E3DA] uppercase tracking-[2px] mb-10">
            Nossa equipe está pronta para atender você.
          </p>
          <a
            href="https://wa.me/5541987760833"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-4 px-10 bg-[#7BAF8E] text-[#1A2F23] text-[9px] font-bold uppercase tracking-[4px] rounded-none hover:bg-[#E8E3DA] transition-colors duration-300"
          >
            Falar com Atendimento
          </a>
        </motion.div>
      </section>
    </>
  );
};

export default Returns;
