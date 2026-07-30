import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";

export default function Pagina() {
  return (
    <>
      <Intestazione titolo="Catalogo" sottotitolo="Tutti i libri che tieni, con ricerca e filtri." />
      <Vuoto titolo="Nessun libro ancora" testo="Dopo l'importazione del foglio Excel troverai qui i tuoi 479 titoli, in griglia di copertine o in tabella." fase="Fase 3 e 4" />
    </>
  );
}
