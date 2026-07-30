import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="Magazzino" sottotitolo="Le copie comprate per rivendere, ancora invendute." />
      <Vuoto titolo="Magazzino vuoto" testo="Ogni copia avrà costo, prezzo richiesto, margine atteso e giorni di giacenza." fase="Fase 5" />
    </>
  );
}
