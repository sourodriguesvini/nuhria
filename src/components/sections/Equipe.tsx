'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONSULTA_LARGO } from '@/lib/tela';

// Equipe fixa descrita pela Dra. Suzana na reunião de 27/10/2026.
// Nutricionista: Verônica Almeida Dias (currículo enviado em 10/11/2026). Registro (CRN): a confirmar.
const EQUIPE = [
  {
    nome: 'Consulta médica',
    papel: 'Dra. Suzana Lessa',
    texto: 'Cuida de pessoas em Niterói desde 2015. Conduz cada consulta a partir da escuta e define as prioridades com você.',
    img: null as string | null,
  },
  {
    nome: 'Nutrição',
    papel: 'Verônica Almeida Dias',
    texto:
      'Nutricionista e farmacêutica, pós-graduada em Nutrição Funcional e Neurociência Clínica. Cuida da saúde intestinal, metabólica e hormonal de forma individualizada e atende na própria clínica, muitas vezes no mesmo dia da consulta médica.',
    img: '/img/equipe-nutricionista.webp',
  },
  {
    nome: 'Avaliação e procedimentos',
    papel: 'Enfermagem',
    texto: 'Conduz a avaliação do corpo e os procedimentos indicados na consulta, explicando cada etapa.',
    img: '/img/equipe-enfermagem.webp',
  },
];

// Retratos que passam no mesmo quadro com a rolagem: a Dra. e, quando a lista chega à Nutrição, a nutricionista.
const RETRATOS = [
  {
    src: '/img/equipe-dra.webp',
    alt: 'Dra. Suzana Lessa sentada à mesa, junto à janela com vista para o mar',
    posicao: '50% 30%',
    rotulo: 'Diretora clínica',
    nome: 'Dra. Suzana Lessa',
    linha: 'Médica · CRM-RJ 52-91631-5',
  },
  {
    src: '/img/equipe-nutricionista-retrato.webp',
    alt: 'Verônica Almeida Dias sorrindo, sentada diante de um quadro com o mar ao pôr do sol',
    posicao: '50% 25%',
    rotulo: 'Nutricionista da equipe',
    nome: 'Verônica Almeida Dias',
    linha: 'Nutricionista e farmacêutica',
  },
];

/**
 * Quem cuida. O retrato se abre por uma fresta, como a janela da abertura, e uma faixa de luz
 * passa por ele. A equipe aparece num fio que se preenche com a rolagem; cada ponto acende quando
 * a luz chega.
 */
export default function Equipe() {
  const secao = useRef<HTMLElement>(null);
  const figura = useRef<HTMLElement>(null);
  const foto = useRef<HTMLDivElement>(null);
  const [retrato, setRetrato] = useState(0);
  const faixa = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLOListElement>(null);
  const preenche = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const abre = { trigger: secao.current, start: 'top 92%', end: 'top top', scrub: true };
      gsap.fromTo(figura.current, { clipPath: 'inset(7% 47% 7% 47% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: abre });
      gsap.fromTo(foto.current, { scale: 1.22 }, { scale: 1, ease: 'none', scrollTrigger: abre });
      gsap.fromTo(
        faixa.current,
        { xPercent: -140 },
        { xPercent: 260, ease: 'none', scrollTrigger: { trigger: figura.current, start: 'top 55%', end: 'bottom 25%', scrub: true } },
      );
      gsap.fromTo(
        preenche.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: lista.current, start: 'top 72%', end: 'bottom 62%', scrub: true } },
      );
      lista.current!.querySelectorAll<HTMLElement>('li').forEach((li) => {
        gsap.fromTo(
          li,
          { opacity: 0, y: 26, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 82%', toggleActions: 'play none none reverse' } },
        );
        ScrollTrigger.create({ trigger: li, start: 'top 64%', onToggle: (s) => li.toggleAttribute('data-aceso', s.isActive), end: 'max' });
      });
      // telas largas: a seção trava na tela e a rolagem passa o quadro da Dra. para a nutricionista
      // celular: o quadro fica acima da lista, então a troca acontece quando a lista chega à Nutrição
      const mm = gsap.matchMedia();
      mm.add(CONSULTA_LARGO, () => {
        ScrollTrigger.create({ trigger: secao.current, start: 'top top', end: 'bottom bottom', onUpdate: (s) => setRetrato(s.progress >= 0.5 ? 1 : 0) });
      });
      mm.add("(max-width: 1023.98px) and (orientation: portrait), (max-width: 639.98px)", () => {
        const nutricao = lista.current!.querySelector<HTMLElement>('li[data-retrato="1"]');
        if (nutricao) ScrollTrigger.create({ trigger: nutricao, start: 'top 45%', end: 'max', onToggle: (s) => setRetrato(s.isActive ? 1 : 0) });
      });
    }, secao);
    return () => ctx.revert();
  }, []);

  return (
    <section id="equipe" data-secao="Quem cuida" ref={secao} className="px-[var(--margem)] largo:h-[230svh]">
      <div className="py-[clamp(96px,15vh,170px)] largo:sticky largo:top-0 largo:flex largo:h-[100svh] largo:items-center largo:pb-0 largo:pt-[64px]">
      <div className="mx-auto grid w-full max-w-[1480px] items-center gap-14 largo:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] largo:gap-[6vw]">
        <figure ref={figura} className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[24px] largo:max-h-[calc(100svh-120px)] largo:max-w-none largo:rounded-[28px]">
          <div ref={foto} className="absolute inset-0 will-change-transform">
            {RETRATOS.map((r, i) => (
              <img
                key={r.src}
                src={r.src}
                alt={i === retrato ? r.alt : ''}
                aria-hidden={i !== retrato}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-luz)]"
                style={{ objectPosition: r.posicao, opacity: i === retrato ? 1 : 0, transform: i === retrato ? 'scale(1)' : 'scale(1.04)' }}
              />
            ))}
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,21,17,0) 45%, rgba(28,21,17,0.45))' }} />
          <div
            ref={faixa}
            aria-hidden
            className="pointer-events-none absolute inset-y-[-10%] left-0 w-[45%] rotate-[12deg]"
            style={{ background: 'linear-gradient(90deg, rgba(255,242,222,0), rgba(255,242,222,0.55), rgba(255,242,222,0))', filter: 'blur(18px)', mixBlendMode: 'soft-light' }}
          />
          <figcaption className="vidro-escuro absolute inset-x-4 bottom-4 rounded-[20px] p-5 text-sunlit largo:inset-x-6 largo:bottom-6 largo:p-6">
            <div key={retrato} className="varre" aria-live="polite">
              <p className="rotulo text-[11px]">{RETRATOS[retrato].rotulo}</p>
              <p className="display mt-2 text-[clamp(22px,2vw,30px)]">{RETRATOS[retrato].nome}</p>
              <p className="mt-1.5 text-[13.5px] text-sunlit/85">{RETRATOS[retrato].linha}</p>
            </div>
          </figcaption>
        </figure>

        <div>
          <p className="abertura text-[clamp(16px,1.5vw,21px)] text-grafite-72">a escuta</p>
          <h2 className="display mt-1 text-[clamp(34px,3.9vw,58px)]">vem primeiro</h2>
          <p className="mt-5 max-w-[440px] largo:mt-4 text-[clamp(15px,1.1vw,16.5px)] leading-[1.65] text-grafite-80">
            Uma equipe pequena e fixa, que acompanha você do primeiro contato ao retorno.
          </p>

          <ol ref={lista} className="relative mt-12 max-w-[540px] largo:mt-8">
            <span className="absolute bottom-3 left-[6px] top-3 w-px bg-grafite/12" aria-hidden>
              <span ref={preenche} className="absolute inset-0 origin-top bg-taupe" style={{ transform: 'scaleY(0)' }} />
            </span>
            {EQUIPE.map((m, i) => (
              <li key={m.nome} data-retrato={i} data-apagado={i !== retrato ? '' : undefined} className="group relative flex gap-6 pb-10 pl-10 last:pb-0 largo:pb-7">
                <span
                  aria-hidden
                  className="absolute left-0 top-[7px] h-[13px] w-[13px] rounded-full border border-taupe/60 bg-[var(--day)] transition-colors duration-700 group-data-[aceso]:border-taupe group-data-[aceso]:bg-taupe"
                />
                <div className="flex-1 transition-opacity duration-700 largo:group-data-[apagado]:opacity-45">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-taupe-texto">{m.papel}</p>
                  <h3 className="display mt-2 text-[clamp(18px,1.5vw,22px)]">{m.nome}</h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-grafite-72">{m.texto}</p>
                </div>
                {m.img && (
                  <img
                    src={m.img}
                    alt=""
                    loading="lazy"
                    className={`h-[72px] w-[72px] shrink-0 rounded-full object-cover sm:h-[88px] sm:w-[88px] ${i === 1 ? 'largo:hidden' : 'hidden sm:block'}`}
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6), 0 10px 26px -14px rgba(43,33,25,0.45)' }}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      </div>
    </section>
  );
}
