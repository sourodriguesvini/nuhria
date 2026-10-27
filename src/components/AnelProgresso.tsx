import { CENTER_SIZE, RING_DOTS } from '@/lib/ring';
import { r4 } from '@/lib/math';

/** Anel de 52 pontos que acende ponto a ponto, no sentido horário. */
export default function AnelProgresso({ acesos, completo, className = 'h-16 w-16', claro = false }: { acesos: number; completo: boolean; className?: string; claro?: boolean }) {
  const apagado = claro ? 'rgba(255,249,241,0.35)' : 'rgba(34,34,34,0.22)';
  return (
    <svg viewBox="-1.2 -1.2 2.4 2.4" className={className} aria-hidden>
      {RING_DOTS.map((d, i) => {
        const a = (d.a * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={r4(Math.sin(a) * d.d)}
            cy={r4(-Math.cos(a) * d.d)}
            r={r4(Math.max(d.s * 1.25, 0.05))}
            fill={i < acesos ? '#A67F60' : apagado}
            style={{ transition: 'fill 0.5s var(--ease-luz)', transitionDelay: `${(i % 13) * 22}ms` }}
          />
        );
      })}
      <circle
        r={r4(CENTER_SIZE)}
        fill={completo ? '#A67F60' : apagado}
        style={{ transition: 'fill 0.8s var(--ease-luz) 0.5s' }}
      />
    </svg>
  );
}
