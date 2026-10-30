'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WHATSAPP_LEGIVEL, waLink } from '@/lib/brand';
import { PERGUNTAS } from '@/lib/perguntas';
import { WhatsApp } from '../Icones';

/**
 * Perguntas frequentes. Ao abrir uma pergunta, a linha de cima acende em luz da esquerda para a
 * direita (fio e ponto) e a resposta desce sem pular a página.
 */
export default function Perguntas() {
  const secao = useRef<HTMLElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [aberta, setAberta] = useState<number | null>(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lista.current!.children,
        { opacity: 0, y: 22, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: lista.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        },
      );
    }, secao);
    return () => ctx.revert();
  }, []);

  return (
    <section id="perguntas" data-secao="Perguntas" ref={secao} className="px-[var(--margem)] py-[clamp(96px,15vh,170px)]">
      <div className="mx-auto grid max-w-[1480px] gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-[6vw]">
        <div className="md:sticky md:top-[18vh] md:self-start">
          <p className="rotulo text-taupe-texto">Perguntas frequentes</p>
          <p className="abertura mt-6 text-[clamp(19px,1.9vw,26px)] text-grafite-72">antes de</p>
          <h2 className="display mt-1 text-[clamp(44px,5.4vw,80px)]">agendar</h2>
          <p className="corpo mt-6 max-w-[360px] text-grafite-72">Não encontrou sua dúvida? A equipe responde pelo WhatsApp.</p>
          <a href={waLink('Olá! Tenho uma dúvida antes de agendar.')} target="_blank" rel="noopener" className="botao botao-contorno mt-8">
            <WhatsApp /> {WHATSAPP_LEGIVEL}
          </a>
        </div>

        <ul ref={lista} className="border-b border-grafite/15">
          {PERGUNTAS.map((q, i) => {
            const on = aberta === i;
            return (
              <li key={q.pergunta} className="relative border-t border-grafite/15">
                <span
                  aria-hidden
                  className="absolute inset-x-0 -top-px h-px origin-left bg-taupe transition-transform duration-[900ms] ease-[var(--ease-luz)]"
                  style={{ transform: `scaleX(${on ? 1 : 0})` }}
                />
                <h3>
                  <button
                    id={`pergunta-${i}`}
                    aria-expanded={on}
                    aria-controls={`resposta-${i}`}
                    onClick={() => setAberta(on ? null : i)}
                    className="group flex w-full items-center gap-5 py-6 text-left md:gap-8 md:py-7"
                  >
                    <span className="w-6 shrink-0 text-[13px] font-light tracking-[0.08em] text-taupe-texto">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`flex-1 text-[clamp(17px,1.5vw,21px)] font-light transition-colors duration-500 ${on ? 'text-grafite' : 'text-grafite/75 group-hover:text-grafite'}`}>
                      {q.pergunta}
                    </span>
                    <span
                      aria-hidden
                      className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${on ? 'border-grafite bg-grafite text-sunlit' : 'border-grafite/25 text-grafite'}`}
                    >
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span className={`absolute h-3.5 w-px bg-current transition-transform duration-500 ${on ? 'scale-y-0' : 'scale-y-100'}`} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`resposta-${i}`}
                  role="region"
                  aria-labelledby={`pergunta-${i}`}
                  className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-luz)]"
                  style={{ gridTemplateRows: on ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className={`max-w-[620px] pb-7 pl-11 text-[15.5px] leading-[1.7] text-grafite-72 transition-opacity duration-700 md:pl-14 ${on ? 'opacity-100' : 'opacity-0'}`}>
                      {q.resposta}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: PERGUNTAS.map((q) => ({ '@type': 'Question', name: q.pergunta, acceptedAnswer: { '@type': 'Answer', text: q.resposta } })),
          }),
        }}
      />
    </section>
  );
}
