import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="Compravendita" sottotitolo="Utile, incassi, magazzino e copie ferme da troppo tempo." />
      <Vuoto titolo="Numeri della compravendita" testo="Qui appariranno utile, incassato, ricarico medio e il valore del magazzino." fase="Fase 5" />
    </>
  );
}
