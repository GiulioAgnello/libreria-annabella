import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="Vetrina pubblica" sottotitolo="Si vede solo ciò che decidi di mostrare." />
      <Vuoto titolo="Vetrina non ancora aperta" testo="Sceglierai copia per copia che cosa mostrare. Prezzi d'acquisto, margini e note restano privati." fase="Fase 6" />
    </>
  );
}
