'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ETAPAS } from '@/lib/brand';
import { clamp, lerp, smoothstep } from '@/lib/math';
import { Seta } from '../Icones';
import { irPara } from '../SmoothScroll';

/**
 * Momento 4 · Um dia na Nuhria.
 * A primeira consulta como uma travessia: rolar para baixo leva o dia para o lado. Feixes de luz
 * de janela atravessam os painéis e esquentam da manhã para a tarde; o fio embaixo marca a etapa.
 */
export default function Dia() {
  const secao = useRef<HTMLElement>(null);
  const trilha = useRef<HTMLDivElement>(null);
  const luz = useRef<HTMLDivElement>(null);
  const tarde = useRef<HTMLDivElement>(null);
  const preenche = useRef<HTMLSpanElement>(null);
  const paineis = useRef<(HTMLElement | null)[]>([]);
  const fotos = useRef<(HTMLImageElement | null)[]>([]);
  const [ativa, setAtiva] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sec = secao.current!;
    const tr = trilha.current!;
    let distancia = 0;
    let W = window.innerWidth;

    const medir = () => {
      W = window.innerWidth;
      distancia = Math.max(0, tr.scrollWidth - W);
      sec.style.height = `${window.innerHeight + distancia}px`;
      ScrollTrigger.refresh();
    };

    let alvo = 0;
    let p = 0;
    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => (alvo = s.progress),
    });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(tr);

    let visivel = false;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    io.observe(sec);

    let ultima = -1;
    let raf = 0;
    const quadro = () => {
      raf = requestAnimationFrame(quadro);
      if (!visivel) return;
      p += (alvo - p) * 0.12;
      const x = -p * distancia;
      tr.style.transform = `translate3d(${x}px, 0, 0)`;

      // foco: todos os painéis do mesmo tamanho e alinhados; os que estão longe do centro só esmaecem
      let maisPerto = 0;
      let menor = Infinity;
      paineis.current.forEach((el, i) => {
        if (!el) return;
        const centro = el.offsetLeft + x + el.offsetWidth / 2;
        const dist = centro - W / 2;
        const foco = 1 - clamp(Math.abs(dist) / (W * 0.8));
        el.style.opacity = String(lerp(0.55, 1, foco));
        const f = fotos.current[i];
        if (f) f.style.transform = `translate3d(${-dist * 0.1}px, 0, 0) scale(1.06)`;
        if (Math.abs(dist) < menor) {
          menor = Math.abs(dist);
          maisPerto = i;
        }
      });
      // enquanto a abertura do momento está no centro, nenhuma etapa está ativa
      const primeiro = paineis.current[0];
      if (primeiro && primeiro.offsetLeft + x + primeiro.offsetWidth / 2 - W / 2 > W * 0.3) maisPerto = -1;
      if (maisPerto !== ultima) {
        ultima = maisPerto;
        setAtiva(maisPerto);
      }

      // a luz atravessa a sala da esquerda para a direita e esquenta
      if (luz.current) luz.current.style.transform = `translate3d(${lerp(-30, 18, p)}%, 0, 0)`;
      if (tarde.current) tarde.current.style.opacity = String(smoothstep(0.2, 1, p) * 0.9);
      if (preenche.current) preenche.current.style.transform = `scaleX(${clamp((p - 0.06) / 0.86)})`;
    };
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      st.kill();
    };
  }, []);

  const irParaEtapa = (i: number) => {
    const sec = secao.current!;
    const el = paineis.current[i];
    if (!el) return;
    const total = sec.offsetHeight - window.innerHeight;
    const distancia = trilha.current!.scrollWidth - window.innerWidth;
    const alvoX = el.offsetLeft + el.offsetWidth / 2 - window.innerWidth / 2;
    irPara(sec.offsetTop + clamp(alvoX / distancia) * total);
  };

  return (
    <section id="primeira-consulta" data-secao="Primeira consulta" ref={secao} className="relative" style={{ height: '520vh' }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={trilha}
          className="absolute inset-y-0 left-0 flex items-center gap-[4vw] pl-[var(--margem)] pr-[18vw] will-change-transform largo:gap-[2.6vw]"
        >
          {/* abertura do momento */}
          <div className="w-[min(84vw,520px)] shrink-0 largo:mr-[4vw]">
            <p className="abertura text-[clamp(19px,1.9vw,26px)] text-grafite-72">da chegada</p>
            <h2 className="display mt-1 text-[clamp(52px,7vw,104px)] baixo:text-[44px]">Ao retorno</h2>
            <p className="lead mt-7 max-w-[440px] text-grafite baixo:mt-4 baixo:text-[15px]">
              Tudo acontece no mesmo dia, em etapas, com tempo para cada uma. Você sabe o que vai acontecer antes de
              chegar.
            </p>
            <p className="rotulo mt-10 baixo:mt-5 flex items-center gap-3 text-[10.5px] text-grafite-72">
              Role para atravessar o dia <Seta className="h-4 w-4" />
            </p>
          </div>

          {ETAPAS.map((e, i) => (
            <article
              key={e.n}
              ref={(el) => {
                paineis.current[i] = el;
              }}
              className="relative h-[64vh] w-[min(78vw,420px)] shrink-0 overflow-hidden rounded-[24px] bg-oat will-change-transform largo:h-[72vh] largo:w-[min(32vw,500px)] largo:rounded-[28px] baixo:h-[74vh] baixo:w-[min(56vw,480px)]"
            >
              <img
                ref={(el) => {
                  fotos.current[i] = el;
                }}
                src={e.img}
                alt={e.alt}
                loading="lazy"
                className="absolute inset-y-0 left-[-10%] h-full w-[120%] max-w-none object-cover will-change-transform"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(28,21,17,0) 45%, rgba(28,21,17,0.35))' }} />
              <div className="vidro absolute inset-x-3 bottom-3 min-h-[11.5rem] rounded-[18px] p-5 largo:inset-x-4 largo:bottom-4 largo:min-h-[13rem] largo:p-6 baixo:min-h-0 baixo:inset-x-3 baixo:bottom-3 baixo:p-4">
                <p className="rotulo text-[10.5px] text-taupe-texto">
                  {e.n} · {e.rotulo}
                </p>
                <h3 className="display mt-2.5 text-[clamp(22px,2.1vw,30px)] leading-[1.05] baixo:mt-1.5 baixo:text-[20px]">{e.titulo}</h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-grafite-72 baixo:mt-1.5 baixo:text-[13px] baixo:leading-[1.45]">{e.texto}</p>
              </div>
            </article>
          ))}

          {/* fim do dia */}
          <div className="w-[min(80vw,440px)] shrink-0 largo:ml-[3vw]">
            <p className="abertura text-[clamp(19px,1.9vw,26px)] text-grafite-72">no fim do dia,</p>
            <h3 className="display mt-1 text-[clamp(40px,4.6vw,68px)] baixo:text-[32px]">o próximo encontro já marcado</h3>
            <p className="corpo mt-6 max-w-[380px] text-grafite-72 baixo:mt-3">
              Para quem mora fora da cidade, a consulta pode ser por teleconsulta. A equipe combina o formato no primeiro
              contato.
            </p>
            <a href="#contato" onClick={(ev) => (ev.preventDefault(), irPara('#contato'))} className="botao botao-escuro mt-8">
              Comece por uma conversa <Seta />
            </a>
          </div>
        </div>

        {/* feixes de luz de janela, atravessando a cena */}
        <div
          ref={luz}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[-50%] w-[200%] will-change-transform"
          style={{
            background:
              'repeating-linear-gradient(104deg, rgba(255,242,222,0) 0vw, rgba(255,242,222,0) 7vw, rgba(255,242,222,0.6) 10vw, rgba(255,242,222,0) 13vw, rgba(255,242,222,0) 24vw)',
            filter: 'blur(22px)',
            mixBlendMode: 'soft-light',
          }}
        />
        <div
          ref={tarde}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(100deg, rgba(255,214,170,0) 30%, rgba(234,170,110,0.32))', mixBlendMode: 'soft-light', opacity: 0 }}
        />

        {/* fio e ponto: as cinco etapas */}
        <div className="absolute inset-x-[var(--margem)] bottom-[4.5vh] largo:bottom-[5vh]">
          <div className="relative h-px bg-grafite/15">
            <span ref={preenche} className="absolute inset-0 origin-left bg-taupe" style={{ transform: 'scaleX(0)' }} />
          </div>
          <ol className="absolute inset-x-0 -top-[6px] flex justify-between">
            {ETAPAS.map((e, i) => {
              const on = ativa >= i;
              return (
                <li key={e.n} className="relative">
                  <button onClick={() => irParaEtapa(i)} className="group flex flex-col items-center gap-2.5" aria-label={`${e.n} ${e.titulo}`}>
                    <span
                      className={`block h-[13px] w-[13px] rounded-full border transition-all duration-500 ${
                        on ? 'border-taupe bg-taupe' : 'border-taupe/60 bg-[var(--day)]'
                      } ${ativa === i ? 'scale-125' : ''}`}
                    />
                    <span className={`hidden text-[12px] transition-colors duration-500 largo:block baixo:hidden ${ativa === i ? 'text-grafite' : 'text-grafite-72'}`}>
                      {e.rotulo}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
