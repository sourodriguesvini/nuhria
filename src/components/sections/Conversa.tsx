'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WHATSAPP_LEGIVEL, waLink } from '@/lib/brand';
import { RING_DOTS } from '@/lib/ring';
import AnelProgresso from '../AnelProgresso';
import { Seta, WhatsApp } from '../Icones';

type Campo = 'nome' | 'whatsapp' | 'indicacao' | 'mensagem';
type Pergunta = { id: Campo; rotulo: string; texto: (r: Respostas) => string; dica: string; obrigatoria: boolean; tipo: 'text' | 'tel' | 'area' };
type Respostas = Record<Campo, string>;

const PERGUNTAS: Pergunta[] = [
  { id: 'nome', rotulo: 'Nome', texto: () => 'Como prefere ser chamado?', dica: 'Seu nome', obrigatoria: true, tipo: 'text' },
  { id: 'whatsapp', rotulo: 'WhatsApp', texto: (r) => `Prazer, ${r.nome.split(' ')[0]}. Qual é o seu WhatsApp?`, dica: '(DDD) número', obrigatoria: true, tipo: 'tel' },
  { id: 'indicacao', rotulo: 'Indicação', texto: () => 'Quem indicou a Nuhria para você?', dica: 'Nome de quem indicou ou como nos conheceu', obrigatoria: false, tipo: 'text' },
  { id: 'mensagem', rotulo: 'O que procura', texto: () => 'Quer contar em poucas palavras o que você procura?', dica: 'Opcional', obrigatoria: false, tipo: 'area' },
];
const CONFIRMA = PERGUNTAS.length;
const ENVIADO = PERGUNTAS.length + 1;

function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function mensagemWhatsApp(r: Respostas) {
  const partes = [`Olá! Sou ${r.nome.trim()}.`, 'Vim pelo site da Nuhria'];
  partes[1] += r.indicacao.trim() ? `, por indicação de ${r.indicacao.trim()}.` : '.';
  if (r.mensagem.trim()) partes.push(r.mensagem.trim());
  partes.push('Gostaria de agendar uma conversa.');
  return partes.join(' ');
}

/**
 * Momento 6 · Comece por uma conversa.
 * O formulário vira uma conversa: uma pergunta por vez. Cada resposta acende um trecho do anel;
 * ao enviar, a volta se completa e o ponto central acende. O contato segue para a equipe
 * (se houver endpoint configurado) e a conversa abre no WhatsApp com a mensagem pronta.
 */
export default function Conversa() {
  const secao = useRef<HTMLElement>(null);
  const foto = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [passo, setPasso] = useState(0);
  const [resp, setResp] = useState<Respostas>({ nome: '', whatsapp: '', indicacao: '', mensagem: '' });
  const [valor, setValor] = useState('');
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState('');
  const [mexeu, setMexeu] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        foto.current,
        { clipPath: 'inset(8% 49.6% 8% 49.6% round 999px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: secao.current, start: 'top 85%', end: 'top 5%', scrub: true } },
      );
      const tema = (t: string) => () => window.dispatchEvent(new CustomEvent('nuhria:tema', { detail: t }));
      ScrollTrigger.create({
        trigger: foto.current,
        start: 'top top+=80',
        end: 'bottom top+=80',
        onEnter: tema('escuro'),
        onEnterBack: tema('escuro'),
        onLeave: tema('claro'),
        onLeaveBack: tema('claro'),
      });
    }, secao);
    return () => ctx.revert();
  }, []);

  // foco na próxima pergunta só depois da primeira interação (sem pular a página no carregamento)
  useEffect(() => {
    if (mexeu && passo < CONFIRMA) campo.current?.focus({ preventScroll: true });
  }, [passo, mexeu]);

  const pergunta = PERGUNTAS[passo];

  const avancar = (e?: FormEvent, pular = false) => {
    e?.preventDefault();
    setMexeu(true);
    if (!pergunta) return;
    const v = pular ? '' : valor.trim();
    if (pergunta.obrigatoria && !v) return setErro('Esta resposta ajuda a equipe a falar com você.');
    if (pergunta.id === 'whatsapp' && v.replace(/\D/g, '').length < 10) return setErro('Confira o número com DDD.');
    setErro('');
    const novas = { ...resp, [pergunta.id]: v };
    setResp(novas);
    const prox = passo + 1;
    setPasso(prox);
    setValor(prox < CONFIRMA ? novas[PERGUNTAS[prox].id] : '');
  };

  const voltarPara = (i: number) => {
    setMexeu(true);
    setErro('');
    setPasso(i);
    setValor(resp[PERGUNTAS[i].id]);
  };

  const enviar = async () => {
    if (!aceite) return setErro('Para enviar, marque a autorização de uso dos dados.');
    setErro('');
    setPasso(ENVIADO);
    // Endpoint opcional (planilha, CRM ou formulário da Hostinger). Sem ele, o contato segue só pelo WhatsApp.
    const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ ...resp, origem: 'site', data: new Date().toISOString() }),
        });
      } catch {
        /* o WhatsApp continua sendo o caminho principal */
      }
    }
  };

  const acesos = passo >= ENVIADO ? RING_DOTS.length : Math.round((RING_DOTS.length * passo) / (PERGUNTAS.length + 1));

  return (
    <section id="contato" data-secao="Contato" ref={secao} className="px-2 pb-2 md:px-4 md:pb-4">
      <div ref={foto} className="relative overflow-hidden rounded-[20px] md:rounded-[28px]">
        <img src="/img/janela-mar.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(28,21,17,0.68), rgba(28,21,17,0.3))' }} />

        <div className="relative grid min-h-[100svh] items-center gap-12 px-5 py-28 md:grid-cols-[1fr_minmax(0,560px)] md:gap-[6vw] md:px-[var(--gutter)]">
          <div className="text-sunlit">
            <p className="rotulo">Contato</p>
            <p className="abertura mt-6 text-[clamp(19px,2vw,28px)]">comece por uma</p>
            <h2 className="display mt-1 text-[clamp(60px,8.4vw,128px)]">Conversa</h2>
            <p className="lead mt-6 max-w-[460px]">
              Leva menos de um minuto. Uma pessoa da nossa equipe responde pelo WhatsApp para entender o que você procura
              e combinar o melhor dia. Valores e condições são informados nessa conversa.
            </p>
            <a
              href={waLink('Olá! Tenho uma dúvida antes de agendar.')}
              target="_blank"
              rel="noopener"
              className="mt-8 inline-flex items-center gap-3 text-[14px] font-semibold text-sunlit/90 underline decoration-sunlit/30 underline-offset-[6px] hover:decoration-sunlit"
            >
              <WhatsApp /> Prefere falar agora? {WHATSAPP_LEGIVEL}
            </a>
            <p className="mt-4 text-[13px] text-sunlit/70">Teleconsulta para quem mora fora da cidade.</p>
          </div>

          <div className="vidro rounded-[24px] p-6 md:rounded-[28px] md:p-10" style={{ background: 'rgba(255,249,241,0.8)' }}>
            <div className="flex items-center gap-4">
              <AnelProgresso acesos={acesos} completo={passo >= ENVIADO} className="h-[76px] w-[76px] shrink-0" />
              <div>
                <p className="rotulo text-taupe">{passo >= ENVIADO ? 'Uma volta completa' : 'Sua conversa com a Nuhria'}</p>
                <p className="mt-1 text-[13px] text-grafite-72">
                  {passo < CONFIRMA ? `Pergunta ${passo + 1} de ${PERGUNTAS.length}` : passo === CONFIRMA ? 'Tudo certo?' : 'Recebido'}
                </p>
              </div>
            </div>

            {/* respostas anteriores */}
            {passo > 0 && passo < ENVIADO && (
              <ul className="mt-6 space-y-1 border-t border-grafite/10 pt-4">
                {PERGUNTAS.slice(0, Math.min(passo, PERGUNTAS.length)).map((q, i) => (
                  <li key={q.id}>
                    <button onClick={() => voltarPara(i)} className="group flex w-full items-baseline justify-between gap-4 py-1.5 text-left">
                      <span className="text-[12px] uppercase tracking-[0.14em] text-grafite/45">{q.rotulo}</span>
                      <span className="truncate text-[14px] text-grafite group-hover:text-taupe">{resp[q.id] || '—'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {pergunta && (
              <form key={pergunta.id} onSubmit={avancar} className="varre mt-7">
                <label htmlFor={`c-${pergunta.id}`} className="abertura block text-[clamp(21px,2vw,27px)] leading-snug text-grafite">
                  {pergunta.texto(resp)}
                </label>
                {pergunta.tipo === 'area' ? (
                  <textarea
                    id={`c-${pergunta.id}`}
                    ref={campo}
                    rows={3}
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={pergunta.dica}
                    className="mt-5 w-full resize-none border-b border-grafite/25 bg-transparent pb-3 text-[17px] outline-none placeholder:text-grafite/35 focus:border-taupe"
                  />
                ) : (
                  <input
                    id={`c-${pergunta.id}`}
                    ref={campo}
                    type={pergunta.tipo === 'tel' ? 'tel' : 'text'}
                    inputMode={pergunta.tipo === 'tel' ? 'tel' : 'text'}
                    autoComplete={pergunta.id === 'nome' ? 'name' : pergunta.id === 'whatsapp' ? 'tel' : 'off'}
                    value={valor}
                    onChange={(e) => setValor(pergunta.tipo === 'tel' ? mascaraTelefone(e.target.value) : e.target.value)}
                    onFocus={() => setMexeu(true)}
                    placeholder={pergunta.dica}
                    className="mt-5 w-full border-b border-grafite/25 bg-transparent pb-3 text-[19px] outline-none placeholder:text-grafite/35 focus:border-taupe"
                  />
                )}
                {erro && <p className="mt-3 text-[13px] text-taupe">{erro}</p>}
                <div className="mt-7 flex items-center gap-3">
                  <button type="submit" className="botao botao-escuro">
                    Continuar <Seta />
                  </button>
                  {!pergunta.obrigatoria && (
                    <button type="button" onClick={() => avancar(undefined, true)} className="botao botao-contorno">
                      Pular
                    </button>
                  )}
                </div>
              </form>
            )}

            {passo === CONFIRMA && (
              <div className="varre mt-7">
                <p className="abertura text-[clamp(21px,2vw,27px)] leading-snug">Tudo certo, {resp.nome.split(' ')[0]}?</p>
                <label className="mt-6 flex cursor-pointer items-start gap-3 text-[13.5px] leading-relaxed text-grafite-72">
                  <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-1 h-4 w-4 accent-[#A67F60]" />
                  Concordo que a Nuhria use estes dados apenas para responder ao meu contato, conforme a Política de privacidade.
                </label>
                {erro && <p className="mt-3 text-[13px] text-taupe">{erro}</p>}
                <button onClick={enviar} className="botao botao-escuro mt-7">
                  Enviar <Seta />
                </button>
              </div>
            )}

            {passo >= ENVIADO && (
              <div className="varre mt-7">
                <h3 className="display text-[clamp(28px,2.8vw,40px)]">Recebemos seu contato, {resp.nome.split(' ')[0]}</h3>
                <p className="corpo mt-4 text-grafite-72">
                  Uma pessoa da nossa equipe vai falar com você pelo WhatsApp para combinar o melhor dia. Se preferir, a
                  conversa já pode começar agora.
                </p>
                <a href={waLink(mensagemWhatsApp(resp))} target="_blank" rel="noopener" className="botao botao-escuro mt-7">
                  <WhatsApp /> Abrir conversa no WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
