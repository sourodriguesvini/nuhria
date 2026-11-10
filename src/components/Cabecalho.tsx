'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logotipo, { AssinaturaDra } from './Logotipo';
import { Fechar, Menu, WhatsApp } from './Icones';
import { irPara } from './SmoothScroll';
import { ENDERECO, WHATSAPP_LEGIVEL, waLink } from '@/lib/brand';

const LINKS = [
  ['Início', '#abertura'],
  ['A Nuhria', '#sistemas'],
  ['Áreas de atuação', '#areas'],
  ['Primeira consulta', '#primeira-consulta'],
  ['Quem cuida', '#equipe'],
  ['O lugar', '#lugar'],
  ['Contato', '#contato'],
] as const;

/**
 * Cabeçalho: claro sobre a abertura escura (tema "escuro"), vidro claro no resto da página.
 * O tema é trocado pelas seções com foto via evento `nuhria:tema`. Fora da página inicial,
 * os links levam de volta à seção na Início.
 */
export default function Cabecalho() {
  const naInicio = usePathname() === '/';
  const [tema, setTema] = useState<'escuro' | 'claro'>(naInicio ? 'escuro' : 'claro');
  const [aberto, setAberto] = useState(false);
  const botaoMenu = useRef<HTMLButtonElement>(null);
  const botaoFechar = useRef<HTMLButtonElement>(null);
  const abriu = useRef(false);

  useEffect(() => {
    const on = (e: Event) => setTema((e as CustomEvent).detail);
    window.addEventListener('nuhria:tema', on);
    return () => window.removeEventListener('nuhria:tema', on);
  }, []);

  // menu: trava a rolagem, leva o foco para dentro e devolve ao fechar; Esc fecha
  useEffect(() => {
    if (aberto) {
      abriu.current = true;
      window.__lenis?.stop();
      botaoFechar.current?.focus();
      const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
      window.addEventListener('keydown', esc);
      return () => window.removeEventListener('keydown', esc);
    }
    window.__lenis?.start();
    if (abriu.current) botaoMenu.current?.focus();
  }, [aberto]);

  const escuro = tema === 'escuro';
  // ações do cabeçalho: só texto e ícone, sem fundo de botão (o mais leve possível)
  const leve = 'flex h-11 items-center gap-2 text-[13px] font-medium tracking-[0.02em] opacity-90 transition-opacity duration-300 hover:opacity-100';
  const sombra = escuro ? { textShadow: '0 1px 10px rgba(28,21,17,0.45)' } : undefined;
  const href = (ancora: string) => (naInicio ? ancora : `/${ancora}`);
  const vai = (ancora: string) => (e: React.MouseEvent) => {
    if (!naInicio) return; // navegação normal para /#secao
    e.preventDefault();
    irPara(ancora === '#abertura' ? 0 : ancora);
  };

  return (
    <>
      <a
        href="#conteudo"
        className="botao botao-escuro fixed left-4 top-4 z-[90] -translate-y-24 focus-visible:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 transition-colors duration-700 md:px-8 md:py-5 ${
          escuro ? 'text-sunlit' : 'text-grafite'
        }`}
        // "backwards": depois da entrada a animação não fica ativa (senão o cabeçalho isola o vidro dos botões)
        style={naInicio ? { animation: 'entra 1.4s 3.6s var(--ease-luz) backwards' } : undefined}
      >
        {/* sobre fundo claro, o conteúdo some suavemente sob o cabeçalho em vez de passar por baixo do logotipo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[110px] transition-opacity duration-700 md:h-[130px]"
          style={{ background: 'linear-gradient(to bottom, var(--day) 48%, transparent)', opacity: escuro ? 0 : 1 }}
        />
        <div className="flex min-w-0 flex-1 items-center">
          <button
            ref={botaoMenu}
            onClick={() => setAberto(true)}
            className={leve}
            style={sombra}
            aria-label="Abrir menu"
            aria-expanded={aberto}
            aria-controls="menu-principal"
          >
            <Menu />
            <span className="hidden md:inline">Menu</span>
          </button>
        </div>
        <a
          href={href('#abertura')}
          onClick={vai('#abertura')}
          className="flex shrink-0 flex-col items-center px-3"
          aria-label="Nuhria, Grupo Dra. Suzana Lessa, início"
          style={escuro ? { filter: 'drop-shadow(0 1px 10px rgba(28,21,17,0.35))' } : undefined}
        >
          <Logotipo className="h-[17px] w-auto md:h-[22px]" />
          {/* o nome da Dra. dá força à marca enquanto a Nuhria se torna conhecida */}
          <AssinaturaDra className="mt-[7px] text-[8.5px] md:mt-2 md:text-[10px]" />
        </a>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-5 md:gap-7">
          <a href={waLink()} target="_blank" rel="noopener" className={leve} style={sombra} aria-label="Conversar pelo WhatsApp">
            <WhatsApp />
            <span className="hidden md:inline">WhatsApp</span>
          </a>
          <a href={href('#contato')} onClick={vai('#contato')} className={`${leve} hidden underline decoration-current/40 underline-offset-[6px] md:flex`} style={sombra}>
            Agendar
          </a>
        </div>
      </header>

      {/* Menu em tela cheia */}
      <div
        className={`fixed inset-0 z-[70] transition-[opacity,visibility] duration-700 ${aberto ? 'visible opacity-100' : 'invisible opacity-0'}`}
        inert={!aberto}
      >
        <div className="absolute inset-0 bg-tinta/30 backdrop-blur-xl" onClick={() => setAberto(false)} />
        <nav
          id="menu-principal"
          className={`vidro absolute inset-3 flex flex-col justify-between overflow-y-auto rounded-[28px] p-7 transition-transform duration-700 md:inset-y-6 md:left-6 md:right-auto md:w-[600px] md:p-12 ${
            aberto ? 'translate-x-0' : '-translate-x-8'
          }`}
          style={{ background: 'rgba(255,249,241,0.88)' }}
          aria-label="Menu principal"
        >
          <div className="flex items-center justify-between">
            <button ref={botaoFechar} onClick={() => setAberto(false)} className="botao botao-contorno h-11 gap-2.5 px-4">
              <Fechar /> Fechar
            </button>
            <div className="flex flex-col items-end">
              <Logotipo className="h-[20px] w-auto" />
              <AssinaturaDra className="mt-2 text-[9px]" />
            </div>
          </div>
          <ul className="my-8 space-y-1">
            {LINKS.map(([t, h], i) => (
              <li key={h}>
                <a
                  href={href(h)}
                  onClick={(e) => {
                    setAberto(false);
                    if (!naInicio) return;
                    e.preventDefault();
                    setTimeout(() => irPara(h === '#abertura' ? 0 : h), 350);
                  }}
                  className="group flex items-baseline gap-6 py-1"
                >
                  <span className="w-7 text-sm font-light text-taupe-texto">{String(i + 1).padStart(2, '0')}</span>
                  <span className="display text-[30px] text-grafite-72 transition-colors duration-500 group-hover:text-grafite md:text-[38px]">{t}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-end justify-between gap-6 text-sm leading-6 text-grafite-72">
            <p>
              {ENDERECO.rua} · {ENDERECO.sala.replace(' · Only Offices', '')}
              <br />
              {ENDERECO.cidade}
              <br />
              <span className="text-grafite">WhatsApp {WHATSAPP_LEGIVEL}</span>
            </p>
            <a href={waLink()} target="_blank" rel="noopener" className="botao botao-escuro shrink-0">
              Agendar
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
