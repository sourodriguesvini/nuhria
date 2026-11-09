'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AREAS } from '@/lib/brand';
import { clamp, lerp, smoothstep } from '@/lib/math';
import { Seta } from '../Icones';
import { irPara } from '../SmoothScroll';

const INICIO = 0.06; // trecho de entrada antes da primeira área
const N = AREAS.length;
const ALT = [
  'Mulher fazendo um agachamento leve num estúdio claro, com janelas abertas para o mar',
  'Café da manhã com frutas, pão e água com limão, numa mesa junto à janela com vista para a baía',
  'Mulher sobre a balança de bioimpedância, acompanhada pela enfermeira, numa sala clara',
  'Mulher reclinada numa poltrona, de olhos fechados, enquanto a enfermeira faz um curativo no braço',
  'Rosto de mulher ao sol da manhã, de olhos fechados, com a pele iluminada',
  'Mulher caminhando pela orla de Charitas pela manhã, com garrafa de água na mão',
];

/** Progresso da seção -> posição na lista, com pausa em cada área. */
function posicao(p: number) {
  const bruto = clamp((p - INICIO) / (1 - INICIO * 2)) * (N - 1);
  const i = Math.min(Math.floor(bruto), N - 2);
  const f = bruto - i;
  return i + smoothstep(0.3, 0.7, f);
}

/**
 * Áreas de atuação. A foto ocupa a tela e troca com a rolagem, abrindo por uma fresta de luz a partir
 * do centro. À direita, um painel de vidro com a lista das seis áreas: a ativa fica no centro, maior;
 * as outras esmaecem acima e abaixo.
 */
export default function Mostrador() {
  const secao = useRef<HTMLElement>(null);
  const fotos = useRef<(HTMLImageElement | null)[]>([]);
  const fresta = useRef<HTMLDivElement>(null);
  const itens = useRef<(HTMLButtonElement | null)[]>([]);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sec = secao.current!;
    let alvo = 0;
    let p = 0;
    let ultimo = -1;
    const st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => (alvo = s.progress) });
    let visivel = false;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    io.observe(sec);

    let raf = 0;
    const quadro = () => {
      raf = requestAnimationFrame(quadro);
      if (!visivel) return;
      p += (alvo - p) * 0.1;
      const k = posicao(p);
      const i = Math.floor(k);
      const f = k - i;

      // fotos: a seguinte abre por uma fresta a partir do centro
      fotos.current.forEach((img, n) => {
        if (!img) return;
        let corte = 50;
        if (n <= i) corte = 0;
        else if (n === i + 1) corte = 50 * (1 - f);
        img.style.clipPath = `inset(0 ${corte}% 0 ${corte}%)`;
        img.style.transform = `scale(${n === i + 1 ? lerp(1.12, 1.04, f) : 1.04})`;
      });
      const brilho = Math.sin(Math.PI * clamp(f)) * (i < N - 1 ? 1 : 0);
      const fr = fresta.current!;
      fr.style.opacity = String(brilho);
      fr.style.setProperty('--l', `${50 * (1 - f)}%`);

      // lista: a área ativa no centro, as outras esmaecem
      itens.current.forEach((el, n) => {
        if (!el) return;
        const d = n - k;
        const ad = Math.abs(d);
        el.style.transform = `translate3d(0, ${d * 100}%, 0)`;
        el.style.opacity = String(clamp(1 - ad * 0.24, 0, 1));
        el.style.setProperty('--escala', String(lerp(1, 0.78, clamp(ad))));
      });

      const novo = Math.round(k);
      if (novo !== ultimo) {
        ultimo = novo;
        setAtivo(novo);
      }
    };
    raf = requestAnimationFrame(quadro);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      st.kill();
    };
  }, []);

  useEffect(() => {
    // o cabeçalho fica claro sobre a foto
    const tema = (t: string) => () => window.dispatchEvent(new CustomEvent('nuhria:tema', { detail: t }));
    const st = ScrollTrigger.create({
      trigger: secao.current,
      start: 'top top+=80',
      end: 'bottom top+=80',
      onEnter: tema('escuro'),
      onEnterBack: tema('escuro'),
      onLeave: tema('claro'),
      onLeaveBack: tema('claro'),
    });
    return () => st.kill();
  }, []);

  const irParaArea = (n: number) => {
    const sec = secao.current!;
    const total = sec.offsetHeight - window.innerHeight;
    irPara(sec.offsetTop + (INICIO + (n / (N - 1)) * (1 - INICIO * 2)) * total);
  };

  const area = AREAS[ativo];

  return (
    <section id="areas" data-secao="Áreas de atuação" ref={secao} className="relative h-[640vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-tinta">
        {/* fotos: no desktop a foto termina sob o painel, para a pessoa ficar na parte livre da tela */}
        <div className="absolute inset-0 largo:right-[min(34vw,500px)]">
          {AREAS.map((a, n) => (
            <img
              key={a.slug}
              ref={(el) => {
                fotos.current[n] = el;
              }}
              src={a.img}
              alt={n === ativo ? ALT[n] : ''}
              className="absolute inset-0 h-full w-full object-cover will-change-[clip-path,transform]"
              style={{ clipPath: n === 0 ? 'inset(0 0% 0 0%)' : 'inset(0 50% 0 50%)' }}
              loading={n < 2 ? 'eager' : 'lazy'}
            />
          ))}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(28,21,17,0.1) 30%, rgba(28,21,17,0.45))' }} />
          {/* bordas de luz da fresta durante a troca */}
          <div ref={fresta} aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
            <span className="absolute inset-y-0 left-[var(--l)] w-[2px] -translate-x-1/2 bg-[rgba(255,242,222,0.9)]" style={{ boxShadow: '0 0 40px 12px rgba(255,236,205,0.55)' }} />
            <span className="absolute inset-y-0 right-[var(--l)] w-[2px] translate-x-1/2 bg-[rgba(255,242,222,0.9)]" style={{ boxShadow: '0 0 40px 12px rgba(255,236,205,0.55)' }} />
          </div>
        </div>

        {/* painel de vidro */}
        <div
          className="vidro-escuro absolute inset-x-2 bottom-2 flex h-[max(54%,420px)] max-h-[calc(100%-110px)] flex-col rounded-[20px] px-6 pb-6 pt-6 text-sunlit largo:inset-x-auto largo:bottom-0 largo:right-0 largo:top-0 largo:h-auto largo:max-h-none largo:w-[min(44vw,640px)] largo:rounded-none largo:border-y-0 largo:border-r-0 largo:px-[clamp(40px,4.5vw,80px)] largo:pb-[6vh] largo:pt-[13vh] baixo:pb-4 baixo:pt-[68px]"
          style={{ background: 'linear-gradient(180deg, rgba(28,21,17,0.38), rgba(28,21,17,0.55))' }}
        >
          <div>
            <p className="rotulo">Áreas de atuação</p>
            <p className="abertura mt-4 text-[clamp(17px,1.6vw,22px)] text-sunlit/85 largo:mt-5 baixo:hidden">seis caminhos,</p>
            <h2 className="display mt-1 text-[clamp(26px,7.4vw,32px)] largo:text-[clamp(30px,3.6vw,54px)] baixo:text-[26px]">uma mesma escuta</h2>
          </div>

          {/* lista em roda */}
          <div
            className="relative my-5 min-h-[132px] flex-1 largo:my-8 baixo:my-2 baixo:min-h-[96px]"
            style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)' }}
          >
            <div className="absolute inset-x-0 top-1/2 h-[52px] -translate-y-1/2 border-y border-sunlit/25 largo:h-[58px]" aria-hidden />
            <div className="absolute inset-x-0 top-1/2 h-[52px] -translate-y-1/2 largo:h-[58px]">
              {AREAS.map((a, n) => (
                <button
                  key={a.slug}
                  ref={(el) => {
                    itens.current[n] = el;
                  }}
                  onClick={() => irParaArea(n)}
                  aria-current={n === ativo ? 'true' : undefined}
                  className="absolute inset-0 flex items-center gap-4 text-left will-change-transform"
                >
                  <span className="w-7 shrink-0 text-[12px] font-light tracking-[0.08em] text-sunlit/70">{String(n + 1).padStart(2, '0')}</span>
                  <span
                    className="origin-left text-[clamp(20px,2.1vw,30px)] font-light leading-none transition-transform duration-300"
                    style={{ transform: 'scale(var(--escala, 1))' }}
                  >
                    {a.titulo}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div key={area.slug} className="varre">
            <p className="max-w-[440px] text-[15px] leading-[1.65] text-sunlit/90 largo:text-[16px] baixo:text-[13px] baixo:leading-[1.5]">{area.texto}</p>
            <a
              href="#contato"
              onClick={(e) => (e.preventDefault(), irPara('#contato'))}
              className="botao botao-claro mt-6 hidden largo:inline-flex baixo:hidden"
            >
              Conversar sobre este cuidado <Seta />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
