'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { waLink } from '@/lib/brand';
import { Seta, WhatsApp } from './Icones';
import { irPara } from './SmoothScroll';

/**
 * Ação sempre à mão depois da abertura: no desktop, "Fale com a equipe" no canto;
 * no celular, uma barra com "Agendar uma conversa" e o WhatsApp. Some quando o contato está na tela.
 */
export default function AcaoFixa() {
  const [depoisDaAbertura, setDepois] = useState(false);
  const [noContato, setNoContato] = useState(false);
  const [noDia, setNoDia] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // fora da página inicial (ex.: política de privacidade) a ação fica sempre visível
    if (!document.querySelector('#abertura')) {
      setDepois(true);
      return;
    }
    const depois = ScrollTrigger.create({ trigger: '#abertura', start: 'bottom 70%', end: 'max', onToggle: (s) => setDepois(s.isActive) });
    const contato = ScrollTrigger.create({ trigger: '#contato', start: 'top 75%', end: 'bottom top', onToggle: (s) => setNoContato(s.isActive) });
    // a base da tela já tem função na travessia do dia (o fio) e no lugar (o cartão de endereço)
    const ocupado = { dia: false, lugar: false };
    const marca = (k: 'dia' | 'lugar') => (s: ScrollTrigger) => {
      ocupado[k] = s.isActive;
      setNoDia(ocupado.dia || ocupado.lugar);
    };
    const dia = ScrollTrigger.create({ trigger: '#primeira-consulta', start: 'top 40%', end: 'bottom 60%', onToggle: marca('dia') });
    const lugar = ScrollTrigger.create({ trigger: '#lugar', start: 'top 30%', end: 'bottom bottom', onToggle: marca('lugar') });
    return () => {
      depois.kill();
      contato.kill();
      dia.kill();
      lugar.kill();
    };
  }, []);

  const visivel = depoisDaAbertura && !noContato && !noDia;
  const base = `transition-all duration-700 ${visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`;
  const vaiAoContato = (e: React.MouseEvent) => {
    if (!document.querySelector('#contato')) return; // segue para /#contato
    e.preventDefault();
    irPara('#contato');
  };

  return (
    <>
      <a href="/#contato" onClick={vaiAoContato} className={`vidro fixed bottom-8 right-8 z-50 hidden items-center gap-3 rounded-full py-2 pl-2 pr-5 md:flex ${base}`}>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-grafite text-sunlit">
          <WhatsApp />
        </span>
        <span className="text-[14px] font-semibold">Fale com a equipe</span>
      </a>
      <div className={`vidro fixed inset-x-3 bottom-3 z-50 flex items-center gap-2 rounded-full p-2 md:hidden ${base}`} style={{ background: 'rgba(255,249,241,0.82)' }}>
        <a href="/#contato" onClick={vaiAoContato} className="botao botao-escuro h-12 flex-1">
          Agendar uma conversa <Seta />
        </a>
        <a href={waLink()} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid h-12 w-12 place-items-center rounded-full border border-grafite/20">
          <WhatsApp />
        </a>
      </div>
    </>
  );
}
