'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COR_DO_DIA } from '@/lib/brand';

/** A página esquenta conforme a rolagem: da luz da manhã ao poente. */
export default function CorDoDia() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const cor = gsap.utils.interpolate(COR_DO_DIA);
    const root = document.documentElement;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => root.style.setProperty('--day', cor(s.progress)),
    });
    return () => st.kill();
  }, []);
  return null;
}
