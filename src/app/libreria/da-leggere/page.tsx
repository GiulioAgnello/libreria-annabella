import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="Da leggere" sottotitolo="La pila dei libri comprati e non ancora letti." />
      <Vuoto titolo="La coda è vuota" testo="Ogni libro segnato «da leggere» finirà qui, in una lista che si riordina trascinando." fase="Fase 4" />
    </>
  );
}
