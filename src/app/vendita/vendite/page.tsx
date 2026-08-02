import Intestazione from "@/components/Intestazione";
import ElencoVendite from "@/components/ElencoVendite";
import { venditeStorico } from "@/lib/vendita";

export default async function Pagina() {
  const righe = await venditeStorico();

  return (
    <>
      <Intestazione titolo="Vendite" sottotitolo="Ogni vendita con il suo margine e la sua resa." />
      <ElencoVendite righe={righe} />
    </>
  );
}
