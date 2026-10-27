'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/math';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Rolagem macia (Lenis) sincronizada com o GSAP ScrollTrigger. */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: !prefersReducedMotion(),
    });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);
  return null;
}

export function irPara(alvo: string | number) {
  if (window.__lenis) window.__lenis.scrollTo(alvo, { duration: 2 });
  else if (typeof alvo === 'string') document.querySelector(alvo)?.scrollIntoView({ behavior: 'smooth' });
}
