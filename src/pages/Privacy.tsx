import { motion } from 'framer-motion';

const sections = [
  {
    title: '1. Informações que Coletamos',
    content: [
      'Nome completo e endereço de entrega',
      'Endereço de e-mail e número de telefone',
      'Dados de pagamento (processados por parceiros seguros — não armazenamos dados de cartão)',
      'Dados de navegação: páginas visitadas, tempo de sessão, dispositivo utilizado',
      'Histórico de pedidos e preferências de produto',
    ],
  },
  {
    title: '2. Como Usamos suas Informações',
    content: [
      'Processar e entregar seus pedidos com precisão',
      'Comunicar atualizações sobre status de pedidos e rastreamento',
      'Melhorar a experiência de navegação e personalizar recomendações',
      'Enviar comunicações de marketing (somente com seu consentimento)',
      'Cumprir obrigações legais e prevenir fraudes',
    ],
  },
  {
    title: '3. Compartilhamento de Dados',
    content: [
      'Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros',
      'Compartilhamos informações de entrega com parceiros logísticos exclusivamente para fins de envio',
      'Podemos compartilhar dados com autoridades quando exigido por lei',
      'Parceiros de processamento de pagamento recebem apenas os dados necessários para a transação',
    ],
  },
  {
    title: '4. Seus Direitos (LGPD)',
    content: [
      'Acesso: solicitar uma cópia dos seus dados pessoais armazenados',
      'Correção: atualizar dados incorretos ou desatualizados',
      'Exclusão: solicitar a remoção dos seus dados da nossa base',
      'Portabilidade: receber seus dados em formato legível por máquina',
      'Revogação de consentimento: retirar autorização para uso de dados a qualquer momento',
    ],
  },
  {
    title: '5. Cookies',
    content: [
      'Cookies essenciais: necessários para funcionamento do site (carrinho, sessão)',
      'Cookies analíticos: nos ajudam a entender como o site é utilizado (Google Analytics)',
      'Você pode gerenciar cookies nas configurações do seu navegador',
      'A desativação de cookies essenciais pode afetar o funcionamento do site',
    ],
  },
  {
    title: '6. Contato',
    content: [
      'Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato:',
      'E-mail: lorenzopedrozo1106@gmail.com',
      'Respondemos solicitações em até 15 dias úteis conforme previsto na LGPD',
    ],
  },
];

const Privacy = () => {
  return (
    <>
      <title>Política de Privacidade — Novant</title>

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
            Política de Privacidade
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

export default Privacy;
