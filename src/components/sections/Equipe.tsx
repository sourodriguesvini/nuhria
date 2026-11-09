'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Equipe fixa descrita pela Dra. Suzana na reunião de 27/10/2026.
// Nome e registro (CRN) da nutricionista: a confirmar com a clínica.
const EQUIPE = [
  {
    nome: 'Consulta médica',
    papel: 'Dra. Suzana Lessa',
    texto: 'Cuida de pessoas em Niterói desde 2015. Conduz cada consulta a partir da escuta e define as prioridades com você.',
    img: null as string | null,
  },
  {
    nome: 'Nutrição',
    papel: 'Nutricionista da equipe',
    texto: 'Faz parte da equipe fixa e atende na própria clínica, muitas vezes no mesmo dia da consulta médica.',
    img: '/img/equipe-nutricao.webp',
  },
  {
    nome: 'Avaliação e procedimentos',
    papel: 'Enfermagem',
    texto: 'Conduz a avaliação do corpo e os procedimentos indicados na consulta, explicando cada etapa.',
    img: '/img/equipe-enfermagem.webp',
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
  const foto = useRef<HTMLImageElement>(null);
  const faixa = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLOListElement>(null);
  const preenche = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const abre = { trigger: figura.current, start: 'top 92%', end: 'top 22%', scrub: true };
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
    }, secao);
    return () => ctx.revert();
  }, []);

  return (
    <section id="equipe" data-secao="Quem cuida" ref={secao} className="px-[var(--margem)] py-[clamp(96px,15vh,170px)]">
      <div className="mx-auto grid max-w-[1480px] items-center gap-14 largo:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] largo:gap-[6vw]">
        <figure ref={figura} className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[24px] largo:max-w-none largo:rounded-[28px]">
          <img
            ref={foto}
            src="/img/equipe-dra.webp"
            alt="Dra. Suzana Lessa sentada à mesa, junto à janela com vista para o mar"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[50%_30%] will-change-transform"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,21,17,0) 45%, rgba(28,21,17,0.45))' }} />
          <div
            ref={faixa}
            aria-hidden
            className="pointer-events-none absolute inset-y-[-10%] left-0 w-[45%] rotate-[12deg]"
            style={{ background: 'linear-gradient(90deg, rgba(255,242,222,0), rgba(255,242,222,0.55), rgba(255,242,222,0))', filter: 'blur(18px)', mixBlendMode: 'soft-light' }}
          />
          <figcaption className="vidro-escuro absolute inset-x-4 bottom-4 rounded-[20px] p-5 text-sunlit largo:inset-x-6 largo:bottom-6 largo:p-6">
            <p className="rotulo text-[11px]">Diretora clínica</p>
            <p className="display mt-2 text-[clamp(26px,2.6vw,38px)]">Dra. Suzana Lessa</p>
            <p className="mt-1.5 text-[13.5px] text-sunlit/85">Médica · CRM-RJ 52-91631-5</p>
          </figcaption>
        </figure>

        <div>
          <p className="rotulo text-taupe-texto">Quem cuida</p>
          <p className="abertura mt-6 text-[clamp(19px,1.9vw,26px)] text-grafite-72">a escuta</p>
          <h2 className="display mt-1 text-[clamp(44px,5.4vw,80px)]">vem primeiro</h2>
          <p className="lead mt-6 max-w-[480px] text-grafite">
            Uma equipe pequena e fixa, que acompanha você do primeiro contato ao retorno.
          </p>

          <ol ref={lista} className="relative mt-12 max-w-[540px]">
            <span className="absolute bottom-3 left-[6px] top-3 w-px bg-grafite/12" aria-hidden>
              <span ref={preenche} className="absolute inset-0 origin-top bg-taupe" style={{ transform: 'scaleY(0)' }} />
            </span>
            {EQUIPE.map((m) => (
              <li key={m.nome} className="group relative flex gap-6 pb-10 pl-10 last:pb-0">
                <span
                  aria-hidden
                  className="absolute left-0 top-[7px] h-[13px] w-[13px] rounded-full border border-taupe/60 bg-[var(--day)] transition-colors duration-700 group-data-[aceso]:border-taupe group-data-[aceso]:bg-taupe"
                />
                <div className="flex-1">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-taupe-texto">{m.papel}</p>
                  <h3 className="display mt-2 text-[clamp(22px,2vw,28px)]">{m.nome}</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.65] text-grafite-72">{m.texto}</p>
                </div>
                {m.img && (
                  <img
                    src={m.img}
                    alt=""
                    loading="lazy"
                    className="hidden h-[88px] w-[88px] shrink-0 rounded-full object-cover sm:block"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6), 0 10px 26px -14px rgba(43,33,25,0.45)' }}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
