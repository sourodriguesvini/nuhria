import Fresta from '@/components/sections/Fresta';
import Sinais from '@/components/sections/Sinais';
import Mostrador from '@/components/sections/Mostrador';
import Convite from '@/components/sections/Convite';
import Rodape from '@/components/sections/Rodape';

// "Um dia de luz": a rolagem é a luz atravessando o vidro da clínica, da manhã ao poente.
// Momentos 4 (um dia na Nuhria), 5 (o vidro) e 6 (contato como conversa) entram na próxima rodada.
export default function Inicio() {
  return (
    <main>
      <Fresta />
      <Sinais />
      <Mostrador />
      <Convite />
      <Rodape />
    </main>
  );
}
