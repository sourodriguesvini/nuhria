import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import 'lenis/dist/lenis.css';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import CorDoDia from '@/components/CorDoDia';
import CursorLuz from '@/components/CursorLuz';
import AnelNavegacao from '@/components/AnelNavegacao';
import Cabecalho from '@/components/Cabecalho';

// Mories: licença DEMO no arquivo do projeto. Confirmar licença comercial antes de publicar.
const mories = localFont({
  src: '../fonts/Mories-Regular.woff2',
  variable: '--font-mories',
  display: 'swap',
});
const mont = localFont({
  src: [
    { path: '../fonts/Mont-ExtraLight.woff2', weight: '200' },
    { path: '../fonts/Mont-Light.woff2', weight: '300' },
    { path: '../fonts/Mont-Regular.woff2', weight: '400' },
    { path: '../fonts/Mont-SemiBold.woff2', weight: '600' },
  ],
  variable: '--font-mont',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nuhria · Charitas, Niterói',
  description:
    'Cuidado médico que começa pela escuta e segue com você ao longo do tempo. Com a Dra. Suzana Lessa e equipe, de frente para o mar de Charitas, em Niterói.',
};

export const viewport: Viewport = {
  themeColor: '#FFF9F1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${mories.variable} ${mont.variable}`}>
      <body>
        <SmoothScroll />
        <CorDoDia />
        <Cabecalho />
        {children}
        <AnelNavegacao />
        <CursorLuz />
        <div className="grao" aria-hidden />
      </body>
    </html>
  );
}
