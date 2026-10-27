'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AXIS_DOWN, AXIS_UP, CENTER_SIZE, RING_DOTS, dotNear, ringXY } from '@/lib/ring';
import { clamp, easeInOutCubic, lerp, mulberry32, prefersReducedMotion, smoothstep } from '@/lib/math';
import { Seta } from '../Icones';
import { irPara } from '../SmoothScroll';

// Sinais que aparecem soltos antes de virarem sistema.
const SINAIS = ['sono', 'energia', 'hormônios', 'metabolismo', 'rotina', 'alimentação', 'movimento', 'história'];
const COM_ROTULO = [3, 10, 16, 23, 29, 36, 42, 49];
// Copy aprovada nas peças sociais. Confirmar com a Dra. antes de publicar.
// Ficam todas na metade direita do anel, para os rótulos não cruzarem o texto.
const PRIORIDADES = [
  { i: dotNear(34), t: '01 página' },
  { i: dotNear(92), t: '03 prioridades' },
  { i: dotNear(148), t: '90 dias até a reavaliação' },
];

/**
 * Momento 2 · Sinais dispersos viram prioridade clara.
 * O posicionamento da marca como interação: os 52 sinais soltos, cada um no seu canto, se organizam
 * no anel; três acendem como prioridades e o eixo com o ponto central fecha o símbolo.
 */
export default function Sinais() {
  const secao = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const textoA = useRef<HTMLDivElement>(null);
  const textoB = useRef<HTMLDivElement>(null);
  const rotulos = useRef<(HTMLSpanElement | null)[]>([]);
  const prioridades = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sec = secao.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    const reduzir = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const rnd = mulberry32(2026);
    const sementes = RING_DOTS.map(() => ({
      u: rnd(),
      v: rnd(),
      tam: 1.6 + rnd() * 4.4,
      fase: rnd() * Math.PI * 2,
      ordem: rnd(),
      alfa: 0.28 + rnd() * 0.4,
    }));
    const prioSet = new Map(PRIORIDADES.map((p, k) => [p.i, k]));
    const rotSet = new Map(COM_ROTULO.map((i, k) => [i, k]));

    let W = 1;
    let H = 1;
    const medir = () => {
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cv);

    let alvoP = 0;
    let p = 0;
    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => (alvoP = s.progress),
    });
    let visivel = false;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    io.observe(sec);

    const pos = RING_DOTS.map(() => ({ x: 0, y: 0, r: 0 }));
    let raf = 0;
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      if (!visivel) return;
      p += (alvoP - p) * 0.12;
      const t = agora / 1000;
      const movel = W < 768;
      const cx = movel ? W / 2 : W * 0.63;
      const cy = movel ? H * 0.7 : H * 0.53;
      const R = movel ? Math.min(W * 0.3, H * 0.17) : Math.min(W * 0.19, H * 0.31);
      const area = movel
        ? { x0: W * 0.06, x1: W * 0.74, y0: H * 0.44, y1: H * 0.93 }
        : { x0: W * 0.42, x1: W * 0.96, y0: H * 0.12, y1: H * 0.9 };

      const junta = smoothstep(0.1, 0.58, p);
      const prio = smoothstep(0.6, 0.74, p);
      const deriva = reduzir ? 0 : 1;
      const giro = (1 - junta) * 0 + prio * 0; // reservado: o anel pode girar devagar no fim

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // pontos
      RING_DOTS.forEach((dot, i) => {
        const s = sementes[i];
        const gi = easeInOutCubic(clamp((junta - s.ordem * 0.42) / 0.58));
        const bx = lerp(area.x0, area.x1, s.u) + Math.sin(t * 0.32 + s.fase) * 16 * deriva;
        const by = lerp(area.y0, area.y1, s.v) + Math.cos(t * 0.27 + s.fase * 1.3) * 13 * deriva;
        const alvo = ringXY(dot, cx, cy, R, giro);
        const x = lerp(bx, alvo.x, gi);
        const y = lerp(by, alvo.y, gi);
        let r = lerp(s.tam, alvo.r, gi);
        const k = prioSet.get(i);
        if (k !== undefined) r *= 1 + 1.25 * prio;
        pos[i] = { x, y, r };
        ctx.beginPath();
        ctx.arc(x, y, Math.max(r, 0.6), 0, Math.PI * 2);
        if (k !== undefined && prio > 0.01) {
          ctx.shadowColor = `rgba(166,127,96,${0.55 * prio})`;
          ctx.shadowBlur = 22 * prio;
          ctx.fillStyle = `rgba(${Math.round(lerp(34, 166, prio))},${Math.round(lerp(34, 127, prio))},${Math.round(lerp(34, 96, prio))},${lerp(0.82, 1, prio)})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(34,34,34,${lerp(s.alfa, 0.82, gi)})`;
        }
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // fios entre os sinais nomeados, enquanto viajam (sistema, não sintoma)
      const fio = Math.sin(Math.PI * clamp(junta)) * 0.42;
      if (fio > 0.01) {
        ctx.beginPath();
        COM_ROTULO.forEach((i, k) => {
          const a = pos[i];
          if (k === 0) ctx.moveTo(a.x, a.y);
          else {
            const b = pos[COM_ROTULO[k - 1]];
            ctx.quadraticCurveTo((a.x + b.x) / 2 + (a.y - b.y) * 0.15, (a.y + b.y) / 2 - (a.x - b.x) * 0.15, a.x, a.y);
          }
        });
        ctx.strokeStyle = `rgba(166,127,96,${fio})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // eixo e ponto central: o símbolo se completa
      if (prio > 0.001) {
        const topo = cy - AXIS_UP * R * prio;
        const base = cy + AXIS_DOWN * R * prio;
        const grad = ctx.createLinearGradient(0, topo, 0, base);
        grad.addColorStop(0, 'rgba(34,34,34,0)');
        grad.addColorStop(0.15, 'rgba(34,34,34,0.75)');
        grad.addColorStop(0.85, 'rgba(34,34,34,0.75)');
        grad.addColorStop(1, 'rgba(34,34,34,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 0.6, topo, 1.2, base - topo);
        ctx.beginPath();
        ctx.arc(cx, cy, CENTER_SIZE * R * prio, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34,34,34,0.9)';
        ctx.fill();
      }

      // rótulos dos sinais (somem quando entram no anel)
      const entra = smoothstep(0.0, 0.08, p);
      COM_ROTULO.forEach((i, k) => {
        const el = rotulos.current[k];
        if (!el) return;
        const s = sementes[i];
        const gi = easeInOutCubic(clamp((junta - s.ordem * 0.42) / 0.58));
        const a = pos[i];
        el.style.transform = `translate3d(${a.x + a.r + 10}px, ${a.y - 9}px, 0)`;
        el.style.opacity = String(entra * (1 - smoothstep(0.35, 0.85, gi)));
      });
      // rótulos das prioridades, para fora do anel
      PRIORIDADES.forEach((pr, k) => {
        const el = prioridades.current[k];
        if (!el) return;
        const a = pos[pr.i];
        const dx = a.x - cx;
        const dy = a.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        const ox = cx + (dx / len) * (len + a.r + 18);
        const oy = cy + (dy / len) * (len + a.r + 18);
        const esquerda = dx < -R * 0.2;
        // no celular não cabe ao lado do anel: vira uma lista acima dele
        el.style.transform = movel
          ? `translate3d(${W * 0.055}px, ${H * 0.36 + k * 36}px, 0)`
          : `translate3d(${ox}px, ${oy}px, 0) translate(${esquerda ? '-100%' : dx > R * 0.2 ? '0' : '-50%'}, -50%)`;
        el.style.opacity = String(prio);
      });

      // texto: A sai, B entra
      const a = 1 - smoothstep(0.5, 0.6, p);
      const b = smoothstep(0.62, 0.72, p);
      const ta = textoA.current!;
      const tb = textoB.current!;
      ta.style.opacity = String(a);
      ta.style.transform = `translate3d(0, ${lerp(-26, 0, a)}px, 0)`;
      ta.style.filter = `blur(${(1 - a) * 8}px)`;
      tb.style.opacity = String(b);
      tb.style.transform = `translate3d(0, ${lerp(26, 0, b)}px, 0)`;
      tb.style.filter = `blur(${(1 - b) * 8}px)`;
      tb.style.pointerEvents = b > 0.5 ? 'auto' : 'none';
    };
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      st.kill();
    };
  }, []);

  return (
    <section id="sistemas" data-secao="Sistemas" ref={secao} className="relative h-[430vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
        {SINAIS.map((s, k) => (
          <span
            key={s}
            ref={(el) => {
              rotulos.current[k] = el;
            }}
            className="abertura pointer-events-none absolute left-0 top-0 text-[15px] text-grafite-72 will-change-transform"
            style={{ opacity: 0 }}
            aria-hidden
          >
            {s}
          </span>
        ))}
        {PRIORIDADES.map((pr, k) => (
          <span
            key={pr.t}
            ref={(el) => {
              prioridades.current[k] = el;
            }}
            className="rotulo vidro pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[10.5px] text-grafite will-change-transform"
            style={{ opacity: 0 }}
          >
            {pr.t}
          </span>
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-[13vh] px-[var(--gutter)] md:top-1/2 md:w-[44vw] md:-translate-y-1/2">
          <div ref={textoA} className="max-w-[520px]">
            <p className="rotulo text-taupe">A Nuhria</p>
            <p className="abertura mt-6 text-[clamp(19px,1.9vw,26px)] text-grafite-72">uma medicina que pensa em</p>
            <h2 className="display mt-1 text-[clamp(40px,5vw,72px)]">Sistemas, não em sintomas</h2>
            <p className="corpo mt-7 hidden max-w-[440px] text-grafite-72 md:block">
              Sono, energia, hormônios, rotina. Cada sinal conta uma parte da história. Na Nuhria, a consulta começa
              pela escuta e lê esses sinais juntos, como um sistema.
            </p>
          </div>
          <div ref={textoB} className="absolute inset-x-[var(--gutter)] top-0 max-w-[520px] md:inset-x-auto md:left-[var(--gutter)]" style={{ opacity: 0 }}>
            <p className="rotulo text-taupe">O que você leva</p>
            <p className="abertura mt-6 text-[clamp(19px,1.9vw,26px)] text-grafite-72">sinais dispersos viram</p>
            <h2 className="display mt-1 text-[clamp(40px,5vw,72px)]">Prioridade clara</h2>
            <p className="corpo mt-7 hidden max-w-[440px] text-grafite-72 md:block">
              O que estava espalhado ganha ordem: prioridades claras, decisões e acompanhamento. A decisão continua
              sendo sua.
            </p>
            <a
              href="#contato"
              onClick={(e) => (e.preventDefault(), irPara('#contato'))}
              className="botao botao-contorno mt-8 hidden md:inline-flex"
            >
              Comece por uma conversa <Seta />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
