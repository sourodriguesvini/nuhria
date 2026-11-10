'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { frestaFrag, frestaVert } from '../gl/frestaShader';
import { AXIS_DOWN, AXIS_UP, CENTER_SIZE, RING_DOTS, ringXY } from '@/lib/ring';
import { clamp, easeInOutCubic, easeOutCubic, lerp, mulberry32, prefersReducedMotion, smoothstep } from '@/lib/math';
import { waLink } from '@/lib/brand';
import { Seta } from '../Icones';
import { irPara } from '../SmoothScroll';

const FOTO = '/img/abertura-orla-manha.webp';

// tempos da entrada, em segundos (pedido da Dra. Suzana em 04/11/2026: "como ponteiros de um relógio aparecendo")
const INICIO_ANEL = 1.0; // o eixo acende antes, de 0 a 0,9 s
const VOLTA = 1.8; // tempo para a luz dar a volta no anel
const ACENDE_CENTRO = 3.25; // o centro acende por último e fica como destaque
/** Quando a entrada termina (o cabeçalho e a dica de rolagem aparecem depois disso). */
export const FIM_DA_ENTRADA = ACENDE_CENTRO + 0.6;

/**
 * Momento 1 · Fresta.
 * Ao carregar, como um relógio: primeiro o eixo do símbolo surge como uma fresta de luz (meio-dia e
 * meia-noite); depois os 52 pontos acendem no próprio lugar, em sentido horário a partir do topo; por
 * último o ponto central acende e fica como o ponto mais forte, com os raios saindo dele. Ao rolar:
 * a fresta se abre até virar a janela com o mar, o anel se desfaz em luz e o título surge.
 */
export default function Fresta() {
  const secao = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bloco = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const abertura = useRef<HTMLParagraphElement>(null);
  const final = useRef<HTMLDivElement>(null);
  const dica = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sec = secao.current!;
    const cv = canvas.current!;
    const reduzir = prefersReducedMotion();

    // tema do cabeçalho
    const tema = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom top+=90',
      onLeave: () => window.dispatchEvent(new CustomEvent('nuhria:tema', { detail: 'claro' })),
      onEnterBack: () => window.dispatchEvent(new CustomEvent('nuhria:tema', { detail: 'escuro' })),
    });

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {
      sec.classList.add('sem-webgl');
      return () => tema.kill();
    }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const movel = window.matchMedia('(max-width: 767px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);

    const pontos = Array.from({ length: 53 }, () => new THREE.Vector3());
    const alfas = new Array(53).fill(0);
    const u = {
      uTex: { value: null as THREE.Texture | null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(2600, 1744) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uDpr: { value: dpr },
      uTime: { value: 0 },
      uE: { value: 0 },
      uFrame: { value: 0 },
      uGlow: { value: 0 },
      uWin: { value: new THREE.Vector4() },
      uRad: { value: 1 },
      uBg: { value: new THREE.Vector3(1, 249 / 255, 241 / 255) },
      uDots: { value: pontos },
      uDotA: { value: alfas },
      uCentro: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: frestaVert, fragmentShader: frestaFrag });
    const cena = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const malha = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    cena.add(malha);

    let pronto = false;
    let inicio = 0;
    const tex = new THREE.TextureLoader().load(FOTO, (t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      u.uTex.value = t;
      u.uImg.value.set(t.image.width, t.image.height);
      inicio = performance.now();
      pronto = true;
    });

    // cintilação leve de cada ponto depois de aceso
    const rnd = mulberry32(52);
    const fases = RING_DOTS.map(() => rnd() * Math.PI * 2);

    let W = 1;
    let H = 1;
    let tituloEsq = 0;
    const medir = () => {
      const r = cv.parentElement!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      renderer.setSize(W, H, false);
      u.uRes.value.set(W * dpr, H * dpr);
      const tr = titulo.current!.getBoundingClientRect();
      tituloEsq = tr.left;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cv.parentElement!);

    let alvoP = 0;
    let p = 0;
    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => (alvoP = s.progress),
    });

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove);

    let visivel = true;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    io.observe(sec);

    let raf = 0;
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      if (!visivel || !pronto) return;
      const t = (agora - inicio) / 1000;
      const intro = t; // segundos desde que a foto carregou
      p += (alvoP - p) * 0.14;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const e = easeInOutCubic(clamp(p / 0.62));        // abertura da janela
      const ex = e;
      const ey = easeOutCubic(clamp(e / 0.55));
      const frame = smoothstep(0.55, 1.0, e);

      // anel: centro um pouco acima do meio, raio proporcional à tela
      const R = Math.min(W, H) * (movel ? 0.3 : 0.185);
      const cx = W / 2 + (mouse.x - 0.5) * 10 * (1 - e);
      const cy = H * (movel ? 0.36 : 0.4) - (mouse.y - 0.5) * 8 * (1 - e);

      // janela: começa como o eixo (fresta) e termina como moldura com 16 px de margem
      const eixo = easeOutCubic(clamp(intro / 0.9));
      const meioAlt0 = R * ((AXIS_UP + AXIS_DOWN) / 2) * eixo;
      const centroY0 = cy + (R * (AXIS_DOWN - AXIS_UP)) / 2;
      const margem = movel ? 8 : 16;
      const hx = lerp(0.9, W / 2 - margem, ex);
      const hy = lerp(meioAlt0, H / 2 - margem, ey);
      const wx = W / 2;
      const wy = lerp(centroY0, H / 2, ey);
      const raio = Math.min(movel ? 20 : 28, hx, hy);
      u.uWin.value.set(wx * dpr, (H - wy) * dpr, hx * dpr, hy * dpr);
      u.uRad.value = raio * dpr;
      u.uE.value = e;
      u.uFrame.value = frame;
      u.uTime.value = agora / 1000;
      u.uMouse.value.set(mouse.x, mouse.y);

      // pontos: como um relógio. Primeiro o eixo (meio-dia e meia-noite), depois cada ponto do anel
      // acende no próprio lugar, em sentido horário a partir do topo, e por último o centro.
      const escala = 1 + e * 2.6;
      const some = 1 - smoothstep(0.02, 0.42, e);
      const centroAceso = smoothstep(ACENDE_CENTRO, ACENDE_CENTRO + 0.5, intro);
      RING_DOTS.forEach((dot, i) => {
        const atraso = INICIO_ANEL + (dot.a / 360) * VOLTA;
        const ti = easeOutCubic(clamp((intro - atraso) / 0.45));
        // a luz passa por cada ponto no momento em que ele acende
        const passa = reduzir ? 0 : 0.35 * Math.exp(-Math.pow((intro - atraso - 0.12) * 7, 2));
        const alvo = ringXY(dot, cx, cy, R * escala);
        const r = alvo.r * (1 + e * 2.2) * lerp(0.55, 1, ti);
        pontos[i].set(alvo.x * dpr, (H - alvo.y) * dpr, Math.max(r, 0.8) * dpr);
        // quando o centro acende, o anel baixa um pouco para o centro ser o destaque
        const base = lerp(0.8, 0.6, centroAceso);
        alfas[i] = (ti * base + passa) * some * (0.9 + 0.1 * Math.sin(agora / 760 + fases[i]));
      });
      // ponto central: o toque final. Acende por último, com um pulso, e fica como o ponto mais forte.
      const pulso = reduzir ? 1 : 1 + 0.3 * Math.exp(-Math.pow((intro - ACENDE_CENTRO - 0.35) * 2.6, 2));
      const respira = reduzir ? 1 : 1 + 0.06 * Math.sin(agora / 900);
      pontos[52].set(cx * dpr, (H - cy) * dpr, CENTER_SIZE * R * pulso * respira * dpr);
      const saiCentro = 1 - smoothstep(0.0, 0.14, e);
      alfas[52] = centroAceso * saiCentro;
      // só o ponto central brilha forte, com os raios saindo dele; o eixo fica com uma luz suave
      u.uCentro.value = centroAceso * pulso * saiCentro;
      u.uGlow.value = eixo * lerp(0.45, 0.22, centroAceso);

      renderer.render(cena, cam);

      // ---- texto
      // o título não aparece na abertura: ele surge com a rolagem, revelado pela luz
      const tituloVis = smoothstep(0.02, 0.18, p);
      const esq = wx - hx;
      const dir = wx + hx;
      const h1 = titulo.current!;
      h1.style.setProperty('--l', `${esq - tituloEsq}px`);
      h1.style.setProperty('--r', `${dir - tituloEsq}px`);
      h1.style.setProperty('--suave', `${lerp(130, 12, ex)}px`);
      h1.style.opacity = String(tituloVis);
      abertura.current!.style.opacity = String(tituloVis * lerp(0.75, 1, ex));

      const b = bloco.current!;
      const topo0 = cy + R * AXIS_DOWN + (movel ? 18 : 22);
      // nunca sob o cabeçalho (celular deitado tem pouca altura)
      const topo1 = Math.max(H - b.offsetHeight - H * (movel ? 0.06 : 0.085), 64);
      const mov = smoothstep(0.3, 0.95, e);
      b.style.transform = `translate3d(0, ${lerp(topo0, topo1, mov)}px, 0)`;
      const fim = smoothstep(0.5, 0.7, p);
      final.current!.style.opacity = String(fim);
      final.current!.style.transform = `translate3d(0, ${lerp(24, 0, fim)}px, 0)`;
      final.current!.style.pointerEvents = fim > 0.5 ? 'auto' : 'none';
      dica.current!.style.opacity = String((1 - smoothstep(0.0, 0.05, p)) * smoothstep(FIM_DA_ENTRADA, FIM_DA_ENTRADA + 0.6, intro));
    };
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect();
      io.disconnect();
      st.kill();
      tema.kill();
      tex.dispose();
      material.dispose();
      malha.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section id="abertura" data-secao="Abertura" ref={secao} className="fresta relative h-[290vh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-tinta">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
        {/* sem WebGL: a foto parada, já na moldura */}
        <img src={FOTO} alt="" className="fresta-alt absolute inset-2 hidden h-[calc(100%-16px)] w-[calc(100%-16px)] rounded-[20px] object-cover md:inset-4 md:h-[calc(100%-32px)] md:w-[calc(100%-32px)] md:rounded-[28px]" />

        <div ref={bloco} className="absolute inset-x-0 top-0 flex flex-col items-center px-5 text-center will-change-transform">
          <p ref={abertura} className="abertura text-[clamp(16px,1.6vw,24px)] text-sunlit/90" style={{ opacity: 0 }}>
            perceber vem antes de
          </p>
          <h1
            ref={titulo}
            className="display revela mt-1 text-[clamp(62px,11.2vw,176px)] text-sunlit baixo:text-[clamp(38px,12vh,80px)]"
            style={{ opacity: 0, textShadow: '0 0 60px rgba(255,236,205,0.35)' }}
          >
            Decidir
          </h1>
          <div ref={final} className="mt-6 flex flex-col items-center md:mt-8 baixo:mt-3" style={{ opacity: 0 }}>
            <p className="max-w-[520px] text-[clamp(15px,1.15vw,17px)] leading-[1.6] text-sunlit baixo:max-w-[640px] baixo:text-[14px]" style={{ textShadow: '0 1px 18px rgba(28,21,17,0.55)' }}>
              A Nuhria ilumina o que está por trás dos seus sinais para que o caminho fique claro e a decisão seja sua.
              Cuidado médico com a Dra. Suzana Lessa e equipe, em Charitas, Niterói.
            </p>
            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row baixo:mt-4">
              <a href={waLink()} target="_blank" rel="noopener" className="botao botao-claro w-full sm:w-auto">
                Agendar uma conversa <Seta />
              </a>
              <a
                href="#sistemas"
                onClick={(ev) => (ev.preventDefault(), irPara('#sistemas'))}
                className="botao botao-contorno-claro w-full sm:w-auto"
              >
                Conhecer a Nuhria
              </a>
            </div>
          </div>
        </div>

        <div ref={dica} className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-3 text-sunlit/70" style={{ opacity: 0 }}>
          <span className="rotulo text-[10px]">Role e conheça a Nuhria</span>
          <span className="relative block h-10 w-px overflow-hidden bg-sunlit/20">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-sunlit/80" style={{ animation: 'desce 1.8s var(--ease-luz) infinite' }} />
          </span>
        </div>
      </div>
      <style>{`
        @keyframes desce { from { transform: translateY(-100%) } to { transform: translateY(200%) } }
        .fresta.sem-webgl canvas { display: none }
        .fresta.sem-webgl .fresta-alt { display: block }
        .fresta.sem-webgl .revela { -webkit-mask-image: none; mask-image: none; opacity: 1 !important }
      `}</style>
    </section>
  );
}
