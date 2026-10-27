'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenteFrag, lenteVert } from '../gl/lenteShader';
import { AREAS } from '@/lib/brand';
import { RING_DOTS, dotNear } from '@/lib/ring';
import { clamp, lerp, r4, smoothstep } from '@/lib/math';
import { Seta } from '../Icones';
import { irPara } from '../SmoothScroll';

const INICIO = 0.07; // trecho de entrada antes da primeira área
// As áreas são marcadas pelos próprios pontos da logo: o ponto do anel mais próximo de cada sexto da volta.
const PONTOS_AREA = AREAS.map((_, n) => dotNear((n * 360) / AREAS.length));
const ANGULO_AREA = PONTOS_AREA.map((i) => RING_DOTS[i].a);
const AREA_DO_PONTO = new Map(PONTOS_AREA.map((i, n) => [i, n]));

/** Progresso da seção -> posição no mostrador, com pausa em cada área. */
function posicao(p: number) {
  const bruto = clamp((p - INICIO) / (1 - INICIO * 2)) * (AREAS.length - 1);
  const i = Math.min(Math.floor(bruto), AREAS.length - 2);
  const f = bruto - i;
  return i + smoothstep(0.3, 0.7, f);
}

/** Giro do anel para que o ponto da área k fique sob o eixo (topo). */
function giroPara(k: number) {
  const i = Math.min(Math.floor(k), AREAS.length - 1);
  const j = Math.min(i + 1, AREAS.length - 1);
  return -lerp(ANGULO_AREA[i], ANGULO_AREA[j], k - i);
}

/**
 * Momento 3 · O mostrador das áreas.
 * As seis áreas são pontos do próprio anel, na cor da marca. A rolagem gira o anel como um relógio
 * lento até o eixo de luz apontar para o ponto da área; a foto aparece numa lente de vidro (WebGL).
 */
export default function Mostrador() {
  const secao = useRef<HTMLElement>(null);
  const disco = useRef<HTMLDivElement>(null);
  const giro = useRef<SVGGElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const numeros = useRef<(HTMLSpanElement | null)[]>([]);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sec = secao.current!;
    const cv = canvas.current!;
    let alvoP = 0;
    let p = 0;
    let ultimo = 0;
    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => (alvoP = s.progress),
    });
    let visivel = false;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    io.observe(sec);

    // ---- lente em WebGL
    let renderer: THREE.WebGLRenderer | null = null;
    const u = {
      uA: { value: null as THREE.Texture | null },
      uB: { value: null as THREE.Texture | null },
      uImgA: { value: new THREE.Vector2(1, 1) },
      uImgB: { value: new THREE.Vector2(1, 1) },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 400 },
      uMouse: { value: new THREE.Vector2() },
    };
    const texturas: (THREE.Texture<HTMLImageElement> | null)[] = AREAS.map(() => null);
    let cena: THREE.Scene | null = null;
    let cam: THREE.Camera | null = null;
    let material: THREE.ShaderMaterial | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: lenteVert, fragmentShader: lenteFrag, transparent: true });
      cena = new THREE.Scene();
      cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
      const loader = new THREE.TextureLoader();
      AREAS.forEach((a, i) =>
        loader.load(a.img, (t) => {
          t.colorSpace = THREE.NoColorSpace;
          t.minFilter = THREE.LinearFilter;
          t.generateMipmaps = false;
          texturas[i] = t;
        }),
      );
    } catch {
      sec.classList.add('sem-webgl');
    }

    const medir = () => {
      const r = cv.getBoundingClientRect();
      renderer?.setSize(r.width, r.height, false);
      u.uSize.value = r.width;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cv);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.tx = clamp(((e.clientX - (r.left + r.width / 2)) / r.width) * 2, -1, 1);
      mouse.ty = clamp((-(e.clientY - (r.top + r.height / 2)) / r.height) * 2, -1, 1);
    };
    window.addEventListener('pointermove', onMove);

    let raf = 0;
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      if (!visivel) return;
      p += (alvoP - p) * 0.1;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const k = posicao(p);
      const i = Math.floor(k);
      const f = k - i;

      // o anel gira até o ponto da área ficar sob o eixo
      const rot = giroPara(k);
      giro.current?.setAttribute('transform', `rotate(${r4(rot)})`);
      const R = disco.current!.clientWidth / 2 / 1.25; // viewBox de -1.25 a 1.25
      numeros.current.forEach((el, n) => {
        if (!el) return;
        // o número fica logo depois do seu ponto, no sentido horário, para não cruzar o eixo
        const ang = ((ANGULO_AREA[n] + rot + 9) * Math.PI) / 180;
        el.style.transform = `translate3d(${Math.sin(ang) * R * 1.13}px, ${-Math.cos(ang) * R * 1.13}px, 0) translate(-50%, -50%)`;
        el.style.opacity = String(lerp(0.4, 1, 1 - clamp(Math.abs(n - k))));
      });

      const novo = Math.round(k);
      if (novo !== ultimo) {
        ultimo = novo;
        setAtivo(novo);
      }

      if (renderer && cena && cam) {
        const a = texturas[i];
        const b = texturas[Math.min(i + 1, AREAS.length - 1)];
        if (a) {
          u.uA.value = a;
          u.uImgA.value.set(a.image.width, a.image.height);
        }
        if (b) {
          u.uB.value = b;
          u.uImgB.value.set(b.image.width, b.image.height);
        }
        u.uMix.value = b ? f : 0;
        u.uTime.value = agora / 1000;
        u.uMouse.value.set(mouse.x, mouse.y);
        if (a) renderer.render(cena, cam);
      }
    };
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect();
      io.disconnect();
      st.kill();
      texturas.forEach((t) => t?.dispose());
      material?.dispose();
      renderer?.dispose();
    };
  }, []);

  const irParaArea = (n: number) => {
    const sec = secao.current!;
    const total = sec.offsetHeight - window.innerHeight;
    const p = INICIO + (n / (AREAS.length - 1)) * (1 - INICIO * 2);
    irPara(sec.offsetTop + p * total);
  };

  const area = AREAS[ativo];

  return (
    <section id="areas" data-secao="Áreas de atuação" ref={secao} className="relative h-[720vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          className="mx-auto grid h-full max-w-[1480px] grid-cols-1 content-center gap-y-7 px-[var(--gutter)] pb-[3svh] pt-[80px] [grid-template-areas:'cabeca'_'disco'_'texto']
            md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:grid-rows-[auto_auto] md:gap-x-[6vw] md:gap-y-10 md:pt-[96px] md:[grid-template-areas:'disco_cabeca'_'disco_texto']"
        >
          {/* título da seção */}
          <div className="[grid-area:cabeca] md:self-end">
            <p className="rotulo text-taupe">Áreas de atuação</p>
            <p className="abertura mt-4 text-[clamp(17px,1.6vw,22px)] text-grafite-72 md:mt-5">seis caminhos,</p>
            <h2 className="display mt-1 text-[clamp(30px,3.3vw,48px)]">uma mesma escuta</h2>
          </div>

          {/* o mostrador */}
          <div
            ref={disco}
            className="relative mx-auto aspect-square w-[min(74vw,33svh)] [grid-area:disco] md:w-[min(100%,calc(100svh_-_230px),620px)] md:self-center"
          >
            {/* eixo de luz: desce do alto e aponta para o ponto ativo */}
            <span
              className="absolute bottom-[calc(90%+10px)] left-1/2 h-[7svh] w-px -translate-x-1/2 md:h-[10svh]"
              style={{ background: 'linear-gradient(to bottom, rgba(166,127,96,0), rgba(166,127,96,0.95))' }}
              aria-hidden
            />
            <svg viewBox="-1.25 -1.25 2.5 2.5" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <g ref={giro}>
                {RING_DOTS.map((d, i) => {
                  const a = (d.a * Math.PI) / 180;
                  const n = AREA_DO_PONTO.get(i);
                  const cor = n === undefined ? 'rgba(34,34,34,0.3)' : n === ativo ? '#A67F60' : 'rgba(166,127,96,0.62)';
                  return (
                    <circle
                      key={i}
                      cx={r4(Math.sin(a) * d.d)}
                      cy={r4(-Math.cos(a) * d.d)}
                      r={r4(d.s * 0.9)}
                      fill={cor}
                      style={{ transition: 'fill 0.6s var(--ease-luz)' }}
                    />
                  );
                })}
              </g>
            </svg>
            {/* lente */}
            <div className="absolute inset-[18%] overflow-hidden rounded-full">
              <canvas ref={canvas} className="h-full w-full" aria-hidden />
              <img src={area.img} alt="" className="lente-alt absolute inset-0 hidden h-full w-full object-cover" />
            </div>
            {/* números das áreas */}
            {AREAS.map((_, n) => (
              <span
                key={n}
                ref={(el) => {
                  numeros.current[n] = el;
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 text-[12px] font-light tracking-[0.08em] text-taupe will-change-transform"
              >
                {String(n + 1).padStart(2, '0')}
              </span>
            ))}
          </div>

          {/* área ativa */}
          <div className="[grid-area:texto] md:self-start">
            <div key={area.slug} className="varre">
              <p className="text-[13px] font-light tracking-[0.12em] text-taupe">
                {String(ativo + 1).padStart(2, '0')} <span className="text-grafite/30">/ 06</span>
              </p>
              <h3 className="display mt-3 text-[clamp(28px,3vw,46px)] [overflow-wrap:anywhere]">{area.titulo}</h3>
              <p className="mt-3 max-w-[480px] text-[15px] leading-[1.65] text-grafite-72 md:mt-4 md:text-[16px]">{area.texto}</p>
            </div>
            <ul className="mt-8 hidden max-w-[480px] border-t border-grafite/15 md:block [@media(max-height:760px)]:hidden">
              {AREAS.map((a, n) => (
                <li key={a.slug} className="border-b border-grafite/15">
                  <button onClick={() => irParaArea(n)} className="group flex w-full items-center justify-between py-3 text-left">
                    <span className={`text-[14px] transition-colors duration-500 ${n === ativo ? 'text-grafite' : 'text-grafite/45 group-hover:text-grafite/80'}`}>
                      <span className="mr-4 font-light text-taupe">{String(n + 1).padStart(2, '0')}</span>
                      {a.titulo}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full bg-taupe transition-opacity duration-500 ${n === ativo ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </li>
              ))}
            </ul>
            <a href="#contato" onClick={(e) => (e.preventDefault(), irPara('#contato'))} className="botao botao-escuro mt-8 hidden md:inline-flex">
              Conversar sobre este cuidado <Seta />
            </a>
          </div>
        </div>
      </div>
      <style>{`#areas.sem-webgl canvas{display:none} #areas.sem-webgl .lente-alt{display:block}`}</style>
    </section>
  );
}
