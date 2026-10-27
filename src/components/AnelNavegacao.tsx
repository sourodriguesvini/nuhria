'use client';

import { useEffect, useRef, useState } from 'react';
import { CENTER_SIZE, RING_DOTS } from '@/lib/ring';
import { irPara } from './SmoothScroll';
import { r4 } from '@/lib/math';

/**
 * O anel de 52 pontos como indicador de percurso: cada ponto aceso é um trecho da página.
 * Ao chegar ao fim, o ponto central acende (uma volta completa).
 */
export default function AnelNavegacao() {
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const centro = useRef<SVGCircleElement>(null);
  const [secao, setSecao] = useState('Abertura');

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const n = Math.round(p * RING_DOTS.length);
      if (n === last) return;
      last = n;
      dots.current.forEach((d, i) => d?.setAttribute('data-on', i < n ? '1' : '0'));
      centro.current?.setAttribute('data-on', n >= RING_DOTS.length ? '1' : '0');
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSecao((e.target as HTMLElement).dataset.secao || '')),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    document.querySelectorAll<HTMLElement>('[data-secao]').forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <button
      onClick={() => irPara(0)}
      className="group fixed bottom-8 left-8 z-50 hidden items-center gap-3 md:flex"
      aria-label={`Percurso da página: ${secao}. Voltar ao início`}
      style={{ animation: 'entra 1.4s 2.8s var(--ease-luz) backwards' }}
    >
      <span className="vidro grid h-[60px] w-[60px] place-items-center rounded-full">
        <svg viewBox="-1.18 -1.18 2.36 2.36" className="h-11 w-11" aria-hidden>
          {RING_DOTS.map((d, i) => {
            const a = (d.a * Math.PI) / 180;
            return (
              <circle
                key={i}
                ref={(el) => {
                  dots.current[i] = el;
                }}
                cx={r4(Math.sin(a) * d.d)}
                cy={r4(-Math.cos(a) * d.d)}
                r={r4(Math.max(d.s, 0.022))}
                className="fill-grafite/35 transition-[fill] duration-500 data-[on='1']:fill-taupe"
              />
            );
          })}
          <circle ref={centro} r={CENTER_SIZE} className="fill-grafite/25 transition-[fill] duration-700 data-[on='1']:fill-taupe" />
        </svg>
      </span>
      <span className="vidro rotulo hidden rounded-full px-3.5 py-2 text-[10px] text-grafite opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block">
        {secao}
      </span>
    </button>
  );
}
