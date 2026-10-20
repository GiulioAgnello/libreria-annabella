import Intestazione from "@/components/Intestazione";
import ElencoCatalogo from "@/components/ElencoCatalogo";
import { catalogoLibreria } from "@/lib/libri";

const STATI = ["da leggere", "in lettura", "letto", "abbandonato"];
const PROVENIENZE = ["acquisto", "biblioteca", "audible", "regalo"];

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string; provenienza?: string }>;
}) {
  const [righe, parametri] = await Promise.all([catalogoLibreria(), searchParams]);

  // Solo valori conosciuti: un indirizzo scritto male apre il catalogo intero.
  const stato = STATI.includes(parametri.stato ?? "") ? parametri.stato! : "";
  const provenienza = PROVENIENZE.includes(parametri.provenienza ?? "") ? parametri.provenienza! : "";

  return (
    <>
      <Intestazione titolo="Catalogo" sottotitolo="Tutti i libri che tieni, con ricerca e filtri." />
      {/* La chiave fa ripartire i filtri quando si arriva da un'altra tessera del cruscotto. */}
      <ElencoCatalogo key={`${stato}|${provenienza}`} righe={righe} iniziali={{ stato, provenienza }} />
    </>
  );
}
