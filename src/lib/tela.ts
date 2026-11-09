// Mesmo critério da variante CSS `largo:` (globals.css): cabem duas colunas lado a lado.
export const CONSULTA_LARGO = '(min-width: 1024px), (min-width: 640px) and (orientation: landscape)';
export const telaLarga = () => typeof window !== 'undefined' && window.matchMedia(CONSULTA_LARGO).matches;
