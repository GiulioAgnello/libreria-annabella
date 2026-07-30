import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="Contabilità" sottotitolo="Il vecchio foglio, senza più totali scritti a mano." />
      <Vuoto titolo="Conti da fare" testo="Totale speso, totale incassato, utile e ricarico: tutti calcolati, mai digitati." fase="Fase 5" />
    </>
  );
}
