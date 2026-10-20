import { redirect } from "next/navigation";
import PaginaSemplice from "@/components/PaginaSemplice";
import GuscioArea from "@/components/GuscioArea";
import Intestazione from "@/components/Intestazione";
import { utenteCorrente } from "@/lib/supabase/server";
import { areaDaParametro } from "@/lib/aree";
import ModuloAggiungi from "./ModuloAggiungi";

const TITOLO = "Aggiungi un libro";
const SOTTOTITOLO = "Inquadra il codice a barre. Il resto si scrive da sé.";

/**
 * Da dentro un'area (`?area=libreria` o `?area=vendita`) la pagina resta in
 * quell'area: stesso menu, stessi colori, e la scelta dell'area è già fatta.
 * Dall'ingresso, senza parametro, si sceglie come prima.
 */
export default async function Aggiungi({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const utente = await utenteCorrente();
  if (!utente) redirect("/");

  const area = areaDaParametro((await searchParams).area);

  /* La chiave Google viaggia fino al browser solo per chi ha fatto l'accesso:
     la ricerca su Google Books parte dal telefono (dal server Vercel Google
     risponde 503) e senza chiave finisce nella quota anonima, sempre esaurita. */
  const modulo = <ModuloAggiungi chiaveGoogle={process.env.GOOGLE_BOOKS_API_KEY ?? null} areaIniziale={area} />;

  if (!area) {
    return (
      <PaginaSemplice titolo={TITOLO} sottotitolo={SOTTOTITOLO}>
        {modulo}
      </PaginaSemplice>
    );
  }

  return (
    <GuscioArea area={area}>
      <div className="max-w-[760px]">
        <Intestazione titolo={TITOLO} sottotitolo={SOTTOTITOLO} />
        {modulo}
      </div>
    </GuscioArea>
  );
}
