import Intestazione from "@/components/Intestazione";
import ElencoMagazzino from "@/components/ElencoMagazzino";
import { magazzinoVendita } from "@/lib/vendita";

/*
 * La pagina fa una cosa sola: legge le copie, una volta. Ricerca, filtri,
 * ordinamento e scelta della vista vivono nel browser, dove sono immediati e
 * non costano una richiesta a testa.
 */
export default async function Pagina() {
  const righe = await magazzinoVendita();

  return (
    <>
      <Intestazione titolo="Magazzino" sottotitolo="Le copie comprate per rivendere, ancora da incassare." />
      <ElencoMagazzino righe={righe} />
    </>
  );
}
