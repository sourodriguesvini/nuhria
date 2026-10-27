'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WHATSAPP_LEGIVEL, waLink } from '@/lib/brand';
import { Seta, WhatsApp } from '../Icones';

/**
 * Convite final (provisório até o Momento 6, o contato em forma de conversa).
 * A foto entra pela mesma fresta de luz da abertura, agora em pleno dia.
 */
export default function Convite() {
  const secao = useRef<HTMLElement>(null);
  const foto = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        foto.current,
        { clipPath: 'inset(8% 49.6% 8% 49.6% round 999px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 28px)',
          ease: 'none',
          scrollTrigger: { trigger: secao.current, start: 'top 85%', end: 'top 10%', scrub: true },
        },
      );
      gsap.fromTo(
        texto.current,
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: { trigger: secao.current, start: 'top 30%', end: 'top 0%', scrub: true },
        },
      );
      // cabeçalho claro enquanto a foto escura está atrás dele
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

  return (
    <section id="contato" data-secao="Contato" ref={secao} className="px-2 pb-2 md:px-4 md:pb-4">
      <div ref={foto} className="relative flex min-h-[100svh] overflow-hidden rounded-[20px] md:rounded-[28px]">
        <img src="/img/janela-mar.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,21,17,0.25), rgba(28,21,17,0.66))' }} />
        <div ref={texto} className="relative flex w-full flex-col items-center justify-center px-6 py-28 text-center text-sunlit">
          <p className="rotulo">Contato</p>
          <p className="abertura mt-6 text-[clamp(19px,2vw,28px)]">comece por uma</p>
          <h2 className="display mt-1 text-[clamp(62px,10vw,150px)]">Conversa</h2>
          <p className="lead mt-6 max-w-[540px]">
            Uma pessoa da nossa equipe responde pelo WhatsApp, entende o que você procura e combina o melhor dia.
            Valores e condições são informados nessa conversa.
          </p>
          <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <a href={waLink()} target="_blank" rel="noopener" className="botao botao-claro w-full sm:w-auto">
              Agendar uma conversa <Seta />
            </a>
            <a href={waLink('Olá! Tenho uma dúvida antes de agendar.')} target="_blank" rel="noopener" className="botao botao-contorno-claro w-full sm:w-auto">
              <WhatsApp /> {WHATSAPP_LEGIVEL}
            </a>
          </div>
          <p className="mt-6 text-[13px] text-sunlit/75">Teleconsulta para quem mora fora da cidade.</p>
        </div>
      </div>
    </section>
  );
}
