import Logotipo from '../Logotipo';
import { ENDERECO, IDENTIFICACAO_MEDICA, INSTAGRAM, MAPS, WHATSAPP_LEGIVEL, waLink } from '@/lib/brand';

export default function Rodape() {
  return (
    <footer className="bg-oat px-[var(--gutter)] pb-10 pt-20 text-grafite md:pt-24">
      <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logotipo className="h-[30px] w-auto" />
          <p className="corpo mt-6 max-w-[300px] text-grafite-80">De frente para o mar de Charitas, em Niterói.</p>
        </div>
        <div>
          <p className="rotulo text-taupe-texto">Contato</p>
          <ul className="mt-5 space-y-2.5 text-[14px]">
            <li>
              <a href={waLink()} target="_blank" rel="noopener" className="hover:text-taupe-texto">
                WhatsApp {WHATSAPP_LEGIVEL}
              </a>
            </li>
            <li>Instagram {INSTAGRAM}</li>
          </ul>
        </div>
        <div>
          <p className="rotulo text-taupe-texto">Endereço</p>
          <ul className="mt-5 space-y-2.5 text-[14px]">
            <li>{ENDERECO.rua}</li>
            <li>{ENDERECO.sala}</li>
            <li>{ENDERECO.cidade}</li>
            <li>
              <a href={MAPS} target="_blank" rel="noopener" className="underline decoration-grafite/30 underline-offset-4 hover:text-taupe-texto">
                Como chegar
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="rotulo text-taupe-texto">Atendimento</p>
          <ul className="mt-5 space-y-2.5 text-[14px]">
            <li>Com hora marcada</li>
            <li>Teleconsulta para quem mora fora da cidade</li>
          </ul>
        </div>
      </div>
      <div className="mt-16 flex flex-col gap-3 border-t border-grafite/15 pt-6 text-[13px] text-grafite-80 md:flex-row md:justify-between">
        <p>{IDENTIFICACAO_MEDICA}</p>
        <p>
          <a href="/privacidade/" className="underline decoration-grafite/30 underline-offset-4 hover:text-taupe-texto">
            Política de privacidade
          </a>{' '}
          · © 2026 Nuhria
        </p>
      </div>
    </footer>
  );
}
