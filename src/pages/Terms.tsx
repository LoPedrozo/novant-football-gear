import { motion } from 'framer-motion';

const sections = [
  {
    title: '1. Aceitação dos Termos',
    content: [
      'Ao acessar e utilizar o site da Novant, você concorda com estes Termos de Uso em sua totalidade.',
      'Caso não concorde com qualquer parte destes termos, pedimos que não utilize nossos serviços.',
      'Reservamo-nos o direito de atualizar estes termos a qualquer momento, com notificação prévia no site.',
    ],
  },
  {
    title: '2. Uso do Site',
    content: [
      'O site é destinado exclusivamente ao uso pessoal e não comercial.',
      'É proibido reproduzir, distribuir ou modificar qualquer conteúdo sem autorização prévia.',
      'Não é permitido utilizar o site para fins ilegais, fraudulentos ou que prejudiquem outros usuários.',
      'O acesso automatizado (bots, scrapers) sem autorização é expressamente proibido.',
    ],
  },
  {
    title: '3. Produtos e Preços',
    content: [
      'Os preços exibidos estão sujeitos a alterações sem aviso prévio.',
      'A disponibilidade de estoque não é garantida e pode variar em tempo real.',
      'As imagens dos produtos são ilustrativas e podem apresentar variações de cor dependendo do monitor.',
      'Promoções e descontos têm validade limitada conforme indicado em cada oferta.',
    ],
  },
  {
    title: '4. Pedidos e Pagamentos',
    content: [
      'Um pedido é considerado confirmado somente após aprovação do pagamento.',
      'Aceitamos cartões de crédito e débito das principais bandeiras, PIX e boleto bancário.',
      'Em caso de indisponibilidade de produto após a confirmação, entraremos em contato para reagendamento ou reembolso.',
      'O prazo de processamento é de até 2 dias úteis após a confirmação do pagamento.',
    ],
  },
  {
    title: '5. Propriedade Intelectual',
    content: [
      'Todos os conteúdos do site — textos, imagens, logotipos e design — são protegidos por direitos autorais.',
      'A marca Novant e seus elementos visuais são propriedade exclusiva da empresa.',
      'É proibida a reprodução total ou parcial sem autorização expressa por escrito.',
    ],
  },
  {
    title: '6. Limitação de Responsabilidade',
    content: [
      'Este é um projeto fictício criado para fins de portfólio — não há responsabilidade comercial real.',
      'A Novant não se responsabiliza por danos indiretos, incidentais ou consequentes.',
      'Nossa responsabilidade está limitada ao valor do pedido realizado.',
      'Não garantimos que o site estará livre de erros ou interrupções em todos os momentos.',
    ],
  },
  {
    title: '7. Contato',
    content: [
      'Para dúvidas sobre estes Termos de Uso, entre em contato:',
      'E-mail: lorenzopedrozo1106@gmail.com',
      'Respondemos em até 5 dias úteis.',
    ],
  },
];

const Terms = () => {
  return (
    <>
      <title>Termos de Uso — Novant</title>

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
            Termos de Uso
          </h1>
          <div className="w-8 h-[1.5px] bg-[#7BAF8E] mx-auto mb-5" />
          <p className="text-[10px] text-[#E8E3DA]/40 uppercase tracking-[3px]">
            Última atualização: Janeiro de 2026
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="bg-[#f8f7f4] py-20 px-6">
        <div className="max-w-2xl mx-auto space-y-12">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <h2 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[4px] mb-4">
                {section.title}
              </h2>
              <div className="w-6 h-[1.5px] bg-[#7BAF8E] mb-5" />
              <ul className="space-y-3">
                {section.content.map((line, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#7BAF8E] flex-shrink-0" />
                    <span className="text-[11px] text-[#1A2F23]/60 leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Terms;
