import logo from '@/lib/logotipo.json';

/** Logotipo NUHRIA (vetor do arquivo aprovado), na cor do texto ao redor. */
export default function Logotipo({ className = '', titulo = 'Nuhria' }: { className?: string; titulo?: string }) {
  const [x, y, w, h] = logo.viewBox as number[];
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} className={className} fill="currentColor" role="img" aria-label={titulo}>
      <path d={logo.d} />
    </svg>
  );
}
