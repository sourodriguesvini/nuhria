// Lente de vidro do mostrador: refração esférica, dispersão nas bordas, luz a -45° (a mesma do
// estilo Gelo NUHRIA) e troca de foto por uma fresta de luz que se abre a partir do eixo.

export const lenteVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const lenteFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uImgA;
uniform vec2 uImgB;
uniform float uMix;
uniform float uTime;
uniform float uSize;   // diâmetro em px de tela
uniform vec2 uMouse;   // -1..1 em relação ao centro da lente

vec2 cobre(vec2 uv, vec2 img) {
  float ia = img.x / img.y;
  vec2 sc = ia > 1.0 ? vec2(1.0 / ia, 1.0) : vec2(1.0, ia);
  return (uv - 0.5) * sc + 0.5;
}
vec3 amostra(sampler2D t, vec2 img, vec2 uv, float ca, vec2 dir) {
  vec2 c = cobre(uv, img);
  return vec3(texture2D(t, c + dir * ca).r, texture2D(t, c).g, texture2D(t, c - dir * ca).b);
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float aa = 3.0 / uSize;
  float mascara = 1.0 - smoothstep(1.0 - aa, 1.0, r);
  float z = sqrt(max(0.0, 1.0 - r * r));
  vec2 dir = r > 0.0001 ? p / r : vec2(0.0);

  // refração: o centro aproxima, as bordas puxam para dentro (vidro espesso)
  vec2 q = p * mix(0.74, 0.98, z);
  vec2 uv = q * 0.5 + 0.5 - uMouse * 0.035 * (1.0 - z * 0.5);
  float ca = 0.007 * pow(r, 3.0);
  vec3 a = amostra(uA, uImgA, uv, ca, dir);
  vec3 b = amostra(uB, uImgB, uv, ca, dir);

  // troca: fresta vertical que se abre a partir do eixo
  float borda = abs(p.x) - uMix * 1.06;
  float abre = uMix <= 0.0005 ? 0.0 : 1.0 - smoothstep(-0.012, 0.012, borda);
  vec3 col = mix(a, b, abre);
  float brilho = exp(-abs(borda) * 26.0) * step(0.0005, uMix) * (1.0 - step(0.9995, uMix));
  col += vec3(1.0, 0.95, 0.86) * brilho * 0.85;

  // luz de cima à esquerda (-45°), aro e sombra interna
  vec2 L = normalize(vec2(-0.707, 0.707));
  float aro = smoothstep(0.7, 1.0, r);
  float especular = pow(max(0.0, dot(dir, L)), 9.0) * aro;
  float sombra = pow(max(0.0, dot(dir, -L)), 2.0) * aro;
  col += vec3(1.0, 0.98, 0.94) * (especular * 0.6 + aro * 0.05);
  col *= 1.0 - sombra * 0.24;
  // reflexo que passeia devagar dentro do vidro
  vec2 rf = p - vec2(-0.38, 0.46) - 0.06 * vec2(sin(uTime * 0.35), cos(uTime * 0.27)) + uMouse * 0.08;
  col += vec3(1.0, 0.97, 0.9) * 0.07 * smoothstep(0.55, 0.0, length(rf * vec2(1.0, 1.6)));

  gl_FragColor = vec4(col * mascara, mascara);
}
`;
