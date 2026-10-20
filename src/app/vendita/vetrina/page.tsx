import Intestazione from "@/components/Intestazione";
import GrigliaVetrina from "@/components/GrigliaVetrina";
import CondividiVetrina from "@/components/CondividiVetrina";
import { copiePubbliche } from "@/lib/vetrina";

/**
 * La vetrina vista da dentro la compravendita: stesso menu delle altre pagine,
 * le stesse copie che vedono i clienti, e ognuna si apre per modificarla.
 * La pagina per i clienti resta `/vetrina`, pubblica e senza menu.
 */
export default async function Pagina() {
  const copie = await copiePubbliche();

  return (
    <>
      <Intestazione
        titolo="Vetrina"
        sottotitolo="Le copie che i clienti vedono online. Tocca un libro per modificarlo o toglierlo."
      />
      <CondividiVetrina />
      <GrigliaVetrina copie={copie} modificabile />
    </>
  );
}
