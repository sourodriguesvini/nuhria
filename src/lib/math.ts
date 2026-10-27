export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOutCubic = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/** Aleatório com semente: o mesmo desenho a cada visita. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * "Reduzir movimento" do sistema. Para revisar a experiência completa numa máquina com a
 * preferência ligada, abrir a página com `?movimento` na URL.
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).has('movimento')) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/** Arredonda para o SVG sair igual no servidor e no navegador (evita erro de hidratação). */
export const r4 = (v: number) => Math.round(v * 1e4) / 1e4;
