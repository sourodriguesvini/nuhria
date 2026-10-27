'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/** O cursor é uma fonte de luz suave: um halo quente que segue o ponteiro com atraso. */
export default function CursorLuz() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current!;
    const x = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      el.style.opacity = '1';
    };
    const leave = () => (el.style.opacity = '0');
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[55] h-[560px] w-[560px] rounded-full opacity-0 transition-opacity duration-700"
      style={{
        background: 'radial-gradient(circle, rgba(255,240,214,0.55) 0%, rgba(255,240,214,0.18) 32%, rgba(255,240,214,0) 62%)',
        mixBlendMode: 'soft-light',
        marginLeft: -280,
        marginTop: -280,
      }}
    />
  );
}
