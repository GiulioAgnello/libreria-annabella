import Intestazione from "@/components/Intestazione";
import ElencoCatalogo from "@/components/ElencoCatalogo";
import { catalogoLibreria } from "@/lib/libri";

export default async function Pagina() {
  const righe = await catalogoLibreria();

  return (
    <>
      <Intestazione titolo="Catalogo" sottotitolo="Tutti i libri che tieni, con ricerca e filtri." />
      <ElencoCatalogo righe={righe} />
    </>
  );
}
