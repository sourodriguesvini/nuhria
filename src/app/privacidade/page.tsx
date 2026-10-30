import type { Metadata } from 'next';
import Rodape from '@/components/sections/Rodape';
import { Seta } from '@/components/Icones';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'Como a Nuhria trata os dados enviados pelo formulário de contato do site.',
  alternates: { canonical: '/privacidade/' },
};

// Texto-base para revisão da assessoria jurídica antes de publicar (ver README).
const BLOCOS: { titulo: string; texto: string[] }[] = [
  {
    titulo: 'Quem somos',
    texto: [
      'Este site é da Nuhria, clínica sob a direção clínica da Dra. Suzana Lessa (CRM-RJ 52-91631-5), na Av. Pref. Silvio Picanço, 463, sala 706, Charitas, Niterói (RJ).',
      'Para qualquer assunto sobre os seus dados, fale com a nossa equipe pelo WhatsApp (21) 99606-2680.',
    ],
  },
  {
    titulo: 'Quais dados coletamos',
    texto: [
      'Somente o que você escreve no formulário de contato: nome, número de WhatsApp e, se quiser, quem indicou a Nuhria e o que você procura.',
      'O site não pede documentos, exames nem informações de pagamento.',
    ],
  },
  {
    titulo: 'Para que usamos',
    texto: [
      'Para responder ao seu contato, entender o que você procura e combinar o agendamento. Não usamos seus dados para publicidade e não os vendemos.',
    ],
  },
  {
    titulo: 'Base legal',
    texto: [
      'Tratamos esses dados com o seu consentimento, dado ao marcar a autorização no formulário (Lei 13.709/2018, LGPD, art. 7º, I).',
      'Se, na mensagem, você contar algo sobre a sua saúde, esse dado é sensível: ele é usado apenas para preparar o atendimento, também com o seu consentimento específico (art. 11, I).',
    ],
  },
  {
    titulo: 'Com quem compartilhamos',
    texto: [
      'A conversa acontece pelo WhatsApp, serviço da Meta, que trata os dados conforme a política dele. Os contatos do formulário podem ser guardados numa ferramenta de organização usada pela equipe, com acesso restrito.',
      'Fora isso, não compartilhamos seus dados, a não ser por obrigação legal.',
    ],
  },
  {
    titulo: 'Por quanto tempo guardamos',
    texto: [
      'Pelo tempo necessário para responder ao contato e organizar o agendamento. Se você passar a ser atendida ou atendido pela Nuhria, as informações clínicas seguem as regras do prontuário médico.',
    ],
  },
  {
    titulo: 'Seus direitos',
    texto: [
      'Você pode, a qualquer momento, pedir para confirmar se temos dados seus, acessá-los, corrigi-los, apagá-los ou revogar o consentimento (LGPD, art. 18). Basta escrever para a nossa equipe pelo WhatsApp.',
    ],
  },
  {
    titulo: 'Cookies',
    texto: [
      'Este site não usa cookies de publicidade nem de rastreamento. O navegador pode guardar arquivos técnicos para que a página carregue mais rápido.',
    ],
  },
  {
    titulo: 'Segurança',
    texto: ['O site usa conexão segura (HTTPS) e o acesso aos contatos é restrito à equipe que responde.'],
  },
  {
    titulo: 'Mudanças nesta política',
    texto: ['Esta política pode ser atualizada. A data no topo mostra a versão em vigor.'],
  },
];

export default function Privacidade() {
  return (
    <>
      <main id="conteudo" className="px-[var(--margem)] pb-[120px] pt-[150px] md:pt-[190px]">
        <article className="mx-auto max-w-[760px]">
          <p className="rotulo text-taupe-texto">Política de privacidade</p>
          <p className="abertura mt-6 text-[clamp(19px,1.9vw,26px)] text-grafite-72">como cuidamos dos</p>
          <h1 className="display mt-1 text-[clamp(48px,6.4vw,92px)]">seus dados</h1>
          <p className="mt-6 text-[13px] text-grafite-72">Última atualização: 27 de outubro de 2026</p>

          <div className="mt-14 border-t border-grafite/15">
            {BLOCOS.map((b, i) => (
              <section key={b.titulo} className="grid gap-3 border-b border-grafite/15 py-9 md:grid-cols-[56px_1fr] md:gap-6">
                <span className="text-[13px] font-light tracking-[0.08em] text-taupe-texto">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="display text-[clamp(22px,2vw,28px)]">{b.titulo}</h2>
                  {b.texto.map((t) => (
                    <p key={t.slice(0, 24)} className="mt-3.5 text-[16px] leading-[1.75] text-grafite-72">
                      {t}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <a href="/" className="botao botao-escuro mt-12">
            Voltar ao início <Seta />
          </a>
        </article>
      </main>
      <Rodape />
    </>
  );
}
