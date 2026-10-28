import Fresta from '@/components/sections/Fresta';
import Sinais from '@/components/sections/Sinais';
import Mostrador from '@/components/sections/Mostrador';
import Dia from '@/components/sections/Dia';
import Equipe from '@/components/sections/Equipe';
import Vidro from '@/components/sections/Vidro';
import Perguntas from '@/components/sections/Perguntas';
import Conversa from '@/components/sections/Conversa';
import Rodape from '@/components/sections/Rodape';
import { AREAS, SITE_URL } from '@/lib/brand';

// Dados para o Google: clínica médica com endereço, telefone e áreas.
const clinica = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Nuhria',
  url: SITE_URL,
  image: `${SITE_URL}/og.jpg`,
  telephone: '+55 21 99606-2680',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Pref. Silvio Picanço, 463, sala 706',
    addressLocality: 'Niterói',
    addressRegion: 'RJ',
    addressCountry: 'BR',
  },
  availableService: AREAS.map((a) => ({ '@type': 'MedicalProcedure', name: a.titulo })),
  employee: { '@type': 'Physician', name: 'Dra. Suzana Lessa' },
};

// "Um dia de luz": a rolagem é a luz atravessando o vidro da clínica, da manhã ao poente.
export default function Inicio() {
  return (
    <>
      <main id="conteudo">
        <Fresta />
        <Sinais />
        <Mostrador />
        <Dia />
        <Equipe />
        <Vidro />
        <Perguntas />
        <Conversa />
      </main>
      <Rodape />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(clinica) }} />
    </>
  );
}
