import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="Vendite" sottotitolo="Ogni vendita con il suo margine e il suo ROI." />
      <Vuoto titolo="Nessuna vendita registrata" testo="Le 195 vendite del foglio Excel verranno ricostruite dalle celle con gli underscore." fase="Fase 3 e 5" />
    </>
  );
}
