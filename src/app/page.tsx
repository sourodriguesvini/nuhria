import Fresta from '@/components/sections/Fresta';
import Sinais from '@/components/sections/Sinais';
import Mostrador from '@/components/sections/Mostrador';
import Dia from '@/components/sections/Dia';
import Vidro from '@/components/sections/Vidro';
import Conversa from '@/components/sections/Conversa';
import Rodape from '@/components/sections/Rodape';

// "Um dia de luz": a rolagem é a luz atravessando o vidro da clínica, da manhã ao poente.
export default function Inicio() {
  return (
    <main>
      <Fresta />
      <Sinais />
      <Mostrador />
      <Dia />
      <Vidro />
      <Conversa />
      <Rodape />
    </main>
  );
}
