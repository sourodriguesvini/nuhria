import logo from '@/lib/logotipo.json';

/** Logotipo NUHRIA (vetor do arquivo aprovado), na cor do texto ao redor. */
export default function Logotipo({
  className = '',
  titulo = 'Nuhria',
  style,
}: {
  className?: string;
  titulo?: string;
  style?: React.CSSProperties;
}) {
  const [x, y, w, h] = logo.viewBox as number[];
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} className={className} style={style} fill="currentColor" role="img" aria-label={titulo}>
      <path d={logo.d} />
    </svg>
  );
}

/**
 * "Grupo Dra. Suzana Lessa": assinatura que acompanha a marca (pedido da Dra. em 04/11/2026, para o nome
 * dela dar força à Nuhria enquanto a marca se torna conhecida). Em Mont, caixa alta e espaçada,
 * como o "Clínica" do logotipo, para não disputar com o NUHRIA.
 */
export function AssinaturaDra({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`block whitespace-nowrap font-normal uppercase leading-none tracking-[0.3em] opacity-80 ${className}`}>
      Grupo Dra. Suzana Lessa
    </span>
  );
}
