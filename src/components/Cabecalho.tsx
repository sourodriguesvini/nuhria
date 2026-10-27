'use client';

import { useEffect, useState } from 'react';
import Logotipo from './Logotipo';
import { Fechar, Menu, WhatsApp } from './Icones';
import { irPara } from './SmoothScroll';
import { ENDERECO, WHATSAPP_LEGIVEL, waLink } from '@/lib/brand';

const LINKS = [
  ['Início', '#abertura'],
  ['A Nuhria', '#sistemas'],
  ['Áreas de atuação', '#areas'],
  ['Primeira consulta', '#primeira-consulta'],
  ['O lugar', '#lugar'],
  ['Contato', '#contato'],
] as const;

/**
 * Cabeçalho: claro sobre a abertura escura (tema "escuro"), vidro claro no resto da página.
 * O tema é trocado pela própria abertura via evento `nuhria:tema`.
 */
export default function Cabecalho() {
  const [tema, setTema] = useState<'escuro' | 'claro'>('escuro');
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const on = (e: Event) => setTema((e as CustomEvent).detail);
    window.addEventListener('nuhria:tema', on);
    return () => window.removeEventListener('nuhria:tema', on);
  }, []);

  useEffect(() => {
    if (aberto) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [aberto]);

  const escuro = tema === 'escuro';
  const pilula = escuro ? 'vidro-escuro text-sunlit' : 'vidro text-grafite';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 transition-colors duration-700 md:px-8 md:py-5 ${
          escuro ? 'text-sunlit' : 'text-grafite'
        }`}
        style={{ animation: 'entra 1.4s 2.6s var(--ease-luz) both' }}
      >
        <div className="flex w-[40%] items-center">
          <button
            onClick={() => setAberto(true)}
            className={`botao h-11 gap-2.5 px-4 md:px-5 ${pilula}`}
            aria-label="Abrir menu"
          >
            <Menu />
            <span className="hidden md:inline">Menu</span>
          </button>
        </div>
        <a href="#abertura" onClick={(e) => (e.preventDefault(), irPara(0))} className="block" aria-label="Nuhria, início">
          <Logotipo className="h-[17px] w-auto md:h-[22px]" />
        </a>
        <div className="flex w-[40%] items-center justify-end gap-2.5">
          <a href={waLink()} target="_blank" rel="noopener" className={`botao h-11 gap-2.5 px-4 md:px-5 ${pilula}`}>
            <WhatsApp />
            <span className="hidden md:inline">WhatsApp</span>
          </a>
          <a href="#contato" onClick={(e) => (e.preventDefault(), irPara('#contato'))} className={`botao hidden h-11 px-5 md:inline-flex ${escuro ? 'botao-claro' : 'botao-escuro'}`}>
            Agendar
          </a>
        </div>
      </header>

      {/* Menu em tela cheia */}
      <div
        className={`fixed inset-0 z-[70] transition-[opacity,visibility] duration-700 ${aberto ? 'visible opacity-100' : 'invisible opacity-0'}`}
        aria-hidden={!aberto}
      >
        <div className="absolute inset-0 bg-tinta/30 backdrop-blur-xl" onClick={() => setAberto(false)} />
        <nav
          className={`vidro absolute inset-3 flex flex-col justify-between rounded-[28px] p-7 transition-transform duration-700 md:inset-y-6 md:left-6 md:right-auto md:w-[600px] md:p-12 ${
            aberto ? 'translate-x-0' : '-translate-x-8'
          }`}
          style={{ background: 'rgba(255,249,241,0.86)' }}
          aria-label="Menu principal"
        >
          <div className="flex items-center justify-between">
            <button onClick={() => setAberto(false)} className="botao botao-contorno h-11 gap-2.5 px-4">
              <Fechar /> Fechar
            </button>
            <Logotipo className="h-[20px] w-auto" />
          </div>
          <ul className="space-y-2">
            {LINKS.map(([t, h], i) => (
              <li key={h}>
                <a
                  href={h}
                  onClick={(e) => {
                    e.preventDefault();
                    setAberto(false);
                    setTimeout(() => irPara(h), 350);
                  }}
                  className="group flex items-baseline gap-6 py-1.5"
                >
                  <span className="w-7 text-sm font-light text-taupe">{String(i + 1).padStart(2, '0')}</span>
                  <span className="display text-[34px] text-grafite/55 transition-colors duration-500 group-hover:text-grafite md:text-[44px]">
                    {t}
                  </span>
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
