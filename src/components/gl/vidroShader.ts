// "O vidro": a vista do mar com uma lâmina de vidro espesso por cima. Bisel que refrata e separa as
// cores, interior levemente fosco e aumentado, reflexo de -45° (o mesmo do estilo Gelo NUHRIA),
// faixa de brilho do poente que corre conforme o vidro se move e sombra suave na foto.

export const vidroVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const vidroFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uDpr;
uniform float uTime;
uniform float uP;      // progresso da seção (aproximação e tom de poente)
uniform vec4 uPane;    // centro (px, origem embaixo) e meia-largura/meia-altura
uniform float uRad;
uniform float uBrilho; // posição da faixa de brilho (-1..1)

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float sd(vec2 f) { return sdRoundBox(f - uPane.xy, uPane.zw, uRad); }
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec2 cobre(vec2 uv) {
  float ra = uRes.x / uRes.y;
  float ia = uImg.x / uImg.y;
  vec2 sc = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
  return (uv - 0.5) * sc + 0.5;
}
vec3 foto(vec2 uv) { return texture2D(uTex, cobre(uv)).rgb; }

void main() {
  vec2 frag = vUv * uRes;
  vec2 px = 1.0 / uRes;
  float zoom = mix(1.14, 1.0, smoothstep(0.0, 0.6, uP));
  vec2 base = (vUv - 0.5) / zoom + 0.5 + vec2(sin(uTime * 0.05) * 0.004, cos(uTime * 0.04) * 0.003);

  float d = sd(frag);
  float aa = 1.2 * uDpr;
  float dentro = 1.0 - smoothstep(-aa, aa, d);

  vec2 e = vec2(1.5 * uDpr, 0.0);
  vec2 n = normalize(vec2(sd(frag + e.xy) - sd(frag - e.xy), sd(frag + e.yx) - sd(frag - e.yx)) + 1e-5);
  float bw = 54.0 * uDpr;
  float bisel = smoothstep(-bw, 0.0, d);
  bisel *= bisel;

  // refração: o bisel desvia a imagem para dentro; o miolo aumenta um pouco
  vec2 centro = uPane.xy * px;
  vec2 cBase = (centro - 0.5) / zoom + 0.5;
  vec2 s = mix(base, cBase, 0.07) - n * bisel * 46.0 * uDpr * px;

  // fosco leve (oito amostras)
  vec3 acc = vec3(0.0);
  float rr = 2.6 * uDpr;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    acc += foto(s + vec2(cos(a), sin(a)) * rr * px);
  }
  acc /= 8.0;
  // dispersão de cor no bisel
  vec2 dc = n * bisel * 5.5 * uDpr * px;
  vec3 disp = vec3(foto(s - dc).r, acc.g, foto(s + dc).b);
  vec3 vidro = mix(acc, disp, smoothstep(0.0, 0.6, bisel));
  vidro = vidro * vec3(1.02, 1.0, 0.97) + 0.012;
  // o vidro fica na mesma luz da cena (não brilha mais que a foto)
  vidro *= mix(1.0, 0.8, smoothstep(0.6, 0.0, vUv.x));
  vidro *= mix(1.0, 0.86, smoothstep(0.45, 0.0, vUv.y));

  // luz: aro a -45°, faixa de brilho do poente e reflexo interno
  vec2 L = normalize(vec2(-0.707, 0.707));
  float aro = pow(max(0.0, dot(n, L)), 2.5) * bisel;
  float sombraAro = pow(max(0.0, dot(n, -L)), 2.0) * bisel;
  vec2 rel = (frag - uPane.xy) / uPane.zw;
  float faixa = exp(-pow(rel.x * 0.9 + rel.y * 0.55 - uBrilho, 2.0) * 7.0) * 0.08;
  vidro += vec3(1.0, 0.96, 0.9) * (aro * 0.75 + bisel * 0.06 + faixa);
  vidro *= 1.0 - sombraAro * 0.18;

  // fora do vidro: a vista, com sombra projetada e leitura do texto à esquerda
  vec3 fora = foto(base);
  float sombra = exp(-max(sd(frag - vec2(14.0, -22.0) * uDpr), 0.0) / (40.0 * uDpr)) * 0.26;
  fora *= 1.0 - sombra;
  fora *= mix(1.0, 0.56, smoothstep(0.6, 0.0, vUv.x));
  fora *= mix(1.0, 0.74, smoothstep(0.45, 0.0, vUv.y));

  vec3 col = mix(fora, vidro, dentro);
  col = mix(col, col * vec3(1.06, 0.96, 0.86), smoothstep(0.2, 1.0, uP) * 0.55); // poente
  col += (hash(frag + fract(uTime * 0.37) * 311.0) - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}
`;
