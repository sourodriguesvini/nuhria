'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vidroFrag, vidroVert } from '../gl/vidroShader';
import { ENDERECO, MAPS, WAZE } from '@/lib/brand';
import { clamp, easeOutCubic, lerp, prefersReducedMotion, smoothstep } from '@/lib/math';
import { Seta } from '../Icones';

const FOTO = '/img/orla.webp';

/**
 * Momento 5 · O vidro.
 * "A luz no vidro acontece todo dia." A vista da orla em tela cheia e uma lâmina de vidro espesso
 * por cima, com refração real, que acompanha o cursor (ou o giroscópio no celular) e pega o brilho
 * do poente. O vidro nasce como uma fresta, como na abertura.
 */
export default function Vidro() {
  const secao = useRef<HTMLElement>(null);
  const moldura = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const cartao = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sec = secao.current!;
    const cv = canvas.current!;
    const reduzir = prefersReducedMotion();
    const tema = (t: string) => () => window.dispatchEvent(new CustomEvent('nuhria:tema', { detail: t }));
    const stTema = ScrollTrigger.create({
      trigger: sec,
      start: 'top top+=80',
      end: 'bottom top+=80',
      onEnter: tema('escuro'),
      onEnterBack: tema('escuro'),
      onLeave: tema('claro'),
      onLeaveBack: tema('claro'),
    });

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
    } catch {
      sec.classList.add('sem-webgl');
      return () => stTema.kill();
    }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const movel = window.matchMedia('(max-width: 767px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    const u = {
      uTex: { value: null as THREE.Texture | null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(2600, 1744) },
      uDpr: { value: dpr },
      uTime: { value: 0 },
      uP: { value: 0 },
      uPane: { value: new THREE.Vector4() },
      uRad: { value: 24 },
      uBrilho: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vidroVert, fragmentShader: vidroFrag });
    const cena = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    let pronto = false;
    const tex = new THREE.TextureLoader().load(FOTO, (t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      u.uTex.value = t;
      u.uImg.value.set(t.image.width, t.image.height);
      pronto = true;
    });

    let W = 1;
    let H = 1;
    const medir = () => {
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      renderer.setSize(W, H, false);
      u.uRes.value.set(W * dpr, H * dpr);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cv);

    let alvo = 0;
    let p = 0;
    const st = ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom bottom', onUpdate: (s) => (alvo = s.progress) });
    let visivel = false;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    io.observe(sec);

    // entrada: cursor no desktop, giroscópio no celular, deriva lenta quando ninguém mexe
    const entrada = { x: 0, y: 0, tx: 0, ty: 0, ultimo: 0 };
    const onMove = (e: PointerEvent) => {
      entrada.tx = clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      entrada.ty = clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      entrada.ultimo = performance.now();
    };
    const onGiro = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      entrada.tx = clamp(e.gamma / 25, -1, 1);
      entrada.ty = clamp((e.beta - 45) / 25, -1, 1);
      entrada.ultimo = performance.now();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('deviceorientation', onGiro);

    let raf = 0;
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      if (!visivel || !pronto) return;
      p += (alvo - p) * 0.12;
      const t = agora / 1000;
      if (agora - entrada.ultimo > 2500 && !reduzir) {
        entrada.tx = Math.sin(t * 0.23) * 0.55;
        entrada.ty = Math.sin(t * 0.17 + 1.2) * 0.4;
      }
      entrada.x += (entrada.tx - entrada.x) * 0.035;
      entrada.y += (entrada.ty - entrada.y) * 0.035;

      // a moldura da foto se abre ao entrar
      const abre = easeOutCubic(smoothstep(0.0, 0.42, p));
      const lado = lerp(W * 0.1, movel ? 8 : 16, abre);
      const topo = lerp(H * 0.14, movel ? 8 : 16, abre);
      moldura.current!.style.clipPath = `inset(${topo}px ${lado}px ${topo}px ${lado}px round ${movel ? 20 : 28}px)`;

      // o vidro nasce como uma fresta e cresce
      const nasce = easeOutCubic(smoothstep(0.32, 0.62, p));
      const HX = movel ? W * 0.3 : Math.min(W * 0.15, 260);
      const HY = movel ? H * 0.13 : H * 0.3;
      const hx = lerp(1, HX, nasce);
      const hy = lerp(HY * 0.55, HY, nasce);
      const cx = (movel ? W * 0.5 : W * 0.7) + entrada.x * (movel ? W * 0.12 : W * 0.09);
      const cy = (movel ? H * 0.25 : H * 0.48) + entrada.y * (movel ? H * 0.04 : H * 0.08);
      u.uPane.value.set(cx * dpr, (H - cy) * dpr, hx * dpr, hy * dpr);
      u.uRad.value = Math.min(movel ? 22 : 28, hx) * dpr;
      u.uBrilho.value = entrada.x * 0.9 + entrada.y * 0.3;
      u.uP.value = p;
      u.uTime.value = t;
      renderer.render(cena, cam);

      const ve = smoothstep(0.36, 0.6, p);
      texto.current!.style.opacity = String(ve);
      texto.current!.style.transform = `translate3d(0, ${lerp(30, 0, ve)}px, 0)`;
      const vc = smoothstep(0.5, 0.72, p);
      cartao.current!.style.opacity = String(vc);
      cartao.current!.style.transform = `translate3d(0, ${lerp(24, 0, vc)}px, 0)`;
      cartao.current!.style.pointerEvents = vc > 0.5 ? 'auto' : 'none';
    };
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onGiro);
      ro.disconnect();
      io.disconnect();
      st.kill();
      stTema.kill();
      tex.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section id="lugar" data-secao="O lugar" ref={secao} className="relative h-[230vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={moldura} className="absolute inset-0" style={{ clipPath: 'inset(14% 10% 14% 10% round 28px)' }}>
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
          <img src={FOTO} alt="" className="vidro-alt absolute inset-0 hidden h-full w-full object-cover" />
        </div>

        <div ref={texto} className="absolute inset-x-[var(--gutter)] bottom-[calc(12px+290px)] text-sunlit md:bottom-auto md:top-[16vh] md:max-w-[520px]" style={{ opacity: 0 }}>
          <p className="rotulo">O lugar</p>
          <p className="abertura mt-6 text-[clamp(19px,1.9vw,26px)]">em Charitas, Niterói,</p>
          <h2 className="display mt-1 text-[clamp(44px,5.6vw,84px)]">De frente para o mar</h2>
          <p className="lead mt-6 hidden max-w-[460px] md:block">
            A clínica fica na orla de Charitas, com vista para a baía. A luz do fim da tarde atravessa o vidro todos os
            dias.
          </p>
        </div>

        <div
          ref={cartao}
          className="vidro absolute inset-x-3 bottom-3 rounded-[20px] p-6 md:inset-x-auto md:bottom-[6vh] md:left-[var(--gutter)] md:w-[420px] md:p-7"
          style={{ opacity: 0, background: 'rgba(255,249,241,0.72)' }}
        >
          <p className="rotulo text-taupe">Endereço</p>
          <p className="mt-3 text-[18px] font-light">{ENDERECO.rua}</p>
          <p className="mt-1 text-[14px] text-grafite-72">
            {ENDERECO.sala} · {ENDERECO.cidade}
          </p>
          <p className="mt-4 border-t border-grafite/12 pt-4 text-[13px] text-grafite-72">
            Atendimento com hora marcada. Teleconsulta para quem mora fora da cidade.
          </p>
          <div className="mt-5 flex gap-2.5">
            <a href={MAPS} target="_blank" rel="noopener" className="botao botao-escuro h-12 px-5">
              Como chegar <Seta />
            </a>
            <a href={WAZE} target="_blank" rel="noopener" className="botao botao-contorno h-12 px-5">
              Waze
            </a>
          </div>
        </div>
      </div>
      <style>{`#lugar.sem-webgl canvas{display:none} #lugar.sem-webgl .vidro-alt{display:block}`}</style>
    </section>
  );
}
