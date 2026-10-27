import data from './ring.json';

/**
 * O anel de 52 pontos do símbolo aprovado (uma volta = um ano, 52 semanas).
 * Medido no SVG oficial: `a` = ângulo em graus no sentido horário a partir do topo,
 * `d` = distância ao centro e `s` = raio do ponto, os dois em frações do raio do anel.
 */
export type RingDot = { a: number; d: number; s: number };

type RingData = {
  viewBox: number[];
  center: { x: number; y: number; r: number };
  radius: number;
  axis: { x: number; y0: number; y1: number; w: number };
  dots: RingDot[];
};

export const RING = data as RingData;
export const RING_DOTS = RING.dots;
/** Raio do ponto central em frações do raio do anel. */
export const CENTER_SIZE = RING.center.r / RING.radius;
/** Quanto o eixo passa do centro para cima e para baixo (frações do raio). */
export const AXIS_UP = (RING.center.y - RING.axis.y0) / RING.radius;
export const AXIS_DOWN = (RING.axis.y1 - RING.center.y) / RING.radius;

/** Posição de um ponto do anel em coordenadas de tela (y para baixo). */
export function ringXY(dot: RingDot, cx: number, cy: number, R: number, rotDeg = 0) {
  const a = ((dot.a + rotDeg) * Math.PI) / 180;
  return { x: cx + Math.sin(a) * dot.d * R, y: cy - Math.cos(a) * dot.d * R, r: dot.s * R };
}

/** Índice do ponto do anel mais próximo de um ângulo. */
export function dotNear(angle: number) {
  let best = 0;
  let diff = 999;
  RING_DOTS.forEach((d, i) => {
    const df = Math.abs(((d.a - angle + 540) % 360) - 180);
    if (df < diff) {
      diff = df;
      best = i;
    }
  });
  return best;
}
