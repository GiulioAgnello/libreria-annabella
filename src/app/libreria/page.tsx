import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="La mia libreria" sottotitolo="Quanto hai letto, quanto hai risparmiato, che cosa leggerai adesso." />
      <Vuoto titolo="Numeri della collezione" testo="Qui appariranno i libri in archivio, quelli letti, il risparmio sull'usato e il prossimo libro in coda." fase="Fase 4" />
    </>
  );
}
