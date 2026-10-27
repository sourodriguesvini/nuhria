// Abertura "Fresta": o eixo do símbolo é uma fresta de luz que se abre até virar a janela da sala com o mar.
// Tudo acontece num único shader: janela (SDF de retângulo arredondado), luz que vaza no escuro,
// poeira na luz, os 53 pontos do símbolo (52 do anel + o central) e grão de filme.

export const frestaVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const frestaFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uRes;      // px do canvas
uniform vec2 uImg;      // tamanho da foto
uniform vec2 uMouse;    // 0..1
uniform float uDpr;
uniform float uTime;
uniform float uE;       // abertura da janela 0..1
uniform float uFrame;   // janela assentada na moldura 0..1
uniform float uGlow;    // intensidade da luz no escuro
uniform vec4 uWin;      // centro (px, origem embaixo) e meia-largura/meia-altura
uniform float uRad;     // raio do canto
uniform vec3 uBg;       // cor da página atrás da moldura
uniform vec3 uDots[53]; // x, y (px) e raio (px)
uniform float uDotA[53];

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 frag = vUv * uRes;
  vec3 tinta = vec3(0.110, 0.084, 0.066);
  vec3 luz = vec3(1.0, 0.925, 0.80);

  // ---- foto: cobre a tela, aproxima e respira devagar
  float ra = uRes.x / uRes.y;
  float ia = uImg.x / uImg.y;
  vec2 sc = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
  float zoom = mix(1.30, 1.0, uE);
  vec2 iuv = (vUv - 0.5) * sc / zoom + 0.5;
  float n = noise(iuv * vec2(2.5, 5.0) + vec2(uTime * 0.035, uTime * 0.018));
  iuv.x += (n - 0.5) * 0.006;                 // ar quente se mexendo na cortina
  iuv += (uMouse - 0.5) * vec2(0.014, 0.009) * uE;
  vec3 foto = texture2D(uTex, iuv).rgb;
  foto *= vec3(1.03, 0.995, 0.95);
  // leitura do texto: escurece a base e um halo atrás do bloco de texto quando a janela assenta
  foto *= mix(1.0, 0.5, smoothstep(0.7, 0.0, vUv.y) * uFrame);
  vec2 tq = (vUv - vec2(0.5, 0.32)) * vec2(1.0, 1.7);
  foto *= mix(1.0, 0.62, exp(-dot(tq, tq) * 3.2) * uFrame);
  foto *= mix(1.0, 0.86, smoothstep(0.35, 1.0, abs(vUv.x - 0.5) * 2.0) * uFrame);

  // ---- janela
  float d = sdRoundBox(frag - uWin.xy, uWin.zw, uRad);
  float aa = 1.2 * uDpr;
  float dentro = 1.0 - smoothstep(-aa, aa, d);
  float fina = 1.0 - smoothstep(2.0 * uDpr, 180.0 * uDpr, uWin.z); // fresta fina = luz estourada
  vec3 janela = mix(foto, luz * 1.18, fina * 0.92);

  // ---- fora: tinta quente que vira a cor da página quando a moldura assenta
  vec3 fora = mix(tinta, uBg, uFrame);
  float g = exp(-max(d, 0.0) / ((60.0 + 300.0 * uE) * uDpr));
  float gl = exp(-max(d, 0.0) / (460.0 * uDpr));
  // raios: a luz sai da fresta em feixes que respiram devagar
  vec2 dv = frag - uWin.xy;
  float ang = atan(dv.y, dv.x);
  float raios = 0.62 + 0.38 * noise(vec2(ang * 9.0, uTime * 0.12)) * noise(vec2(ang * 23.0 + 3.1, uTime * 0.07));
  vec3 vaza = luz * (g * 0.62 + gl * 0.16 * raios) * uGlow * (1.0 - uFrame);
  vec2 mp = frag / uDpr;
  float poeira = smoothstep(0.992, 1.0, noise(mp * 0.22 + vec2(uTime * 0.08, -uTime * 0.9))) * gl * (1.0 - uFrame);
  vec3 col = mix(fora + vaza + luz * poeira * 0.9, janela, dentro);

  // ---- pontos de luz do símbolo
  vec3 pts = vec3(0.0);
  for (int i = 0; i < 53; i++) {
    float a = uDotA[i];
    if (a <= 0.002) continue;
    vec3 dt = uDots[i];
    float dd = length(frag - dt.xy);
    float nucleo = 1.0 - smoothstep(dt.z - aa, dt.z + aa, dd);
    float halo = exp(-dd / (dt.z * 1.7 + 2.0 * uDpr)) * 0.5;
    pts += luz * (nucleo + halo) * a;
  }
  col += pts;

  // ---- grão
  col += (hash(frag + fract(uTime * 0.37) * 311.0) - 0.5) * 0.045;
  gl_FragColor = vec4(col, 1.0);
}
`;
