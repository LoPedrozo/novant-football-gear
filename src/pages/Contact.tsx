import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Clock, Plus, Minus } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const faqItems = [
  {
    question: 'Qual o prazo de entrega?',
    answer: 'Os pedidos são processados em até 2 dias úteis. O prazo de entrega varia de 3 a 10 dias úteis dependendo da sua região.',
  },
  {
    question: 'Como faço para trocar ou devolver um produto?',
    answer: 'Você tem até 30 dias após o recebimento para solicitar trocas ou devoluções. O produto deve estar sem uso e na embalagem original. Entre em contato pelo e-mail ou WhatsApp para iniciar o processo.',
  },
  {
    question: 'Como rastrear meu pedido?',
    answer: 'Após a confirmação do pagamento, você receberá um código de rastreio por e-mail em até 2 dias úteis.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos cartões de crédito e débito das principais bandeiras, PIX e boleto bancário.',
  },
  {
    question: 'Os produtos têm garantia?',
    answer: 'Todos os nossos produtos possuem garantia de 90 dias contra defeitos de fabricação.',
  },
  {
    question: 'Como funciona a tabela de tamanhos?',
    answer: 'Cada produto possui uma tabela de tamanhos específica. Recomendamos consultar a tabela na página do produto antes de realizar a compra.',
  },
];

const contactCards = [
  {
    icon: <Mail className="w-7 h-7" />,
    title: 'E-mail',
    description: 'Resposta em até 24 horas úteis',
    contact: 'lorenzopedrozo1106@gmail.com',
    buttonLabel: 'ENVIAR E-MAIL',
    href: 'mailto:lorenzopedrozo1106@gmail.com',
  },
  {
    icon: <WhatsAppIcon />,
    title: 'WhatsApp',
    description: 'Atendimento rápido e direto',
    contact: '(41) 98776-0833',
    buttonLabel: 'CHAMAR NO WHATSAPP',
    href: 'https://wa.me/5541987760833',
  },
  {
    icon: <InstagramIcon />,
    title: 'Instagram',
    description: 'Acompanhe novidades e nos envie uma DM',
    contact: '@lo_pedrozo',
    buttonLabel: 'VER INSTAGRAM',
    href: 'https://instagram.com/lo_pedrozo',
  },
];

const FaqItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="border-b border-[#1A2F23]/10 last:border-b-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className={`text-[11px] font-bold uppercase tracking-[2px] transition-colors duration-200 ${
            open ? 'text-[#7BAF8E]' : 'text-[#1A2F23]'
          }`}
        >
          {question}
        </span>
        <span
          className={`ml-4 flex-shrink-0 transition-colors duration-200 ${
            open ? 'text-[#7BAF8E]' : 'text-[#1A2F23]/50'
          }`}
        >
          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[11px] text-[#1A2F23]/60 leading-relaxed tracking-wide">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Contact = () => {
  return (
    <>
      <title>Contato — Novant</title>

      {/* Section 1 — Hero */}
      <section className="bg-[#1A2F23] py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-[10px] font-medium text-[#7BAF8E] uppercase tracking-[6px] mb-6">
            Novant
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#E8E3DA] uppercase tracking-[6px] mb-6">
            Fale Conosco
          </h1>
          <div className="w-10 h-[1.5px] bg-[#7BAF8E] mx-auto mb-8" />
          <p className="text-[11px] font-light text-[#E8E3DA]/60 uppercase tracking-[3px] max-w-md mx-auto leading-relaxed">
            Estamos aqui para ajudar. Entre em contato pelo canal de sua preferência.
          </p>
        </motion.div>
      </section>

      {/* Section 2 — Contact Cards */}
      <section className="bg-[#f8f7f4] py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-[#1A2F23]/8 p-8 flex flex-col items-start group hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-[#1A2F23] mb-5">
                {card.icon}
              </div>
              <h3 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[4px] mb-2">
                {card.title}
              </h3>
              <p className="text-[10px] text-[#1A2F23]/50 uppercase tracking-[2px] mb-4 leading-relaxed">
                {card.description}
              </p>
              <p className="text-[12px] font-medium text-[#1A2F23] mb-8">
                {card.contact}
              </p>
              <a
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="mt-auto w-full block text-center py-3 px-4 bg-[#1A2F23] text-[#E8E3DA] text-[9px] font-bold uppercase tracking-[3px] rounded-none hover:bg-[#7BAF8E] transition-colors duration-300"
              >
                {card.buttonLabel}
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 3 — Business Hours */}
      <section className="bg-[#f8f7f4] py-20 px-6 border-t border-[#1A2F23]/8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-4 h-4 text-[#7BAF8E]" />
            <h2 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[5px]">
              Horário de Atendimento
            </h2>
          </div>
          <div className="w-8 h-[1.5px] bg-[#7BAF8E] mx-auto mb-8" />
          <div className="space-y-3">
            <p className="text-[11px] text-[#1A2F23] font-medium uppercase tracking-[2px]">
              Segunda a Sábado: 9h às 18h
            </p>
            <p className="text-[11px] text-[#1A2F23]/50 uppercase tracking-[2px]">
              Domingo e Feriados: Fechado
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-[#1A2F23]/8">
            <p className="text-[10px] text-[#1A2F23]/40 uppercase tracking-[2px] leading-relaxed">
              Respondemos e-mails e mensagens dentro do horário comercial
            </p>
          </div>
        </motion.div>
      </section>

      {/* Section 4 — FAQ */}
      <section className="bg-[#f8f7f4] py-24 px-6 border-t border-[#1A2F23]/8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[5px] mb-4">
              Perguntas Frequentes
            </h2>
            <div className="w-8 h-[1.5px] bg-[#7BAF8E] mx-auto mb-4" />
            <p className="text-[10px] text-[#1A2F23]/40 uppercase tracking-[2px]">
              Encontre respostas para as dúvidas mais comuns
            </p>
          </motion.div>

          <div>
            {faqItems.map((item, i) => (
              <FaqItem key={i} question={item.question} answer={item.answer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Bottom CTA */}
      <section className="bg-[#1A2F23] py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          <p className="text-[10px] font-light text-[#E8E3DA]/50 uppercase tracking-[3px] mb-4">
            Ainda com dúvidas?
          </p>
          <p className="text-[13px] font-medium text-[#E8E3DA] uppercase tracking-[2px] mb-10">
            Nossa equipe está pronta para ajudar.
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

export default Contact;
