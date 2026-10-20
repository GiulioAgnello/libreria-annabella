import { redirect } from "next/navigation";
import PaginaSemplice from "@/components/PaginaSemplice";
import { utenteCorrente } from "@/lib/supabase/server";
import ModuloAggiungi from "./ModuloAggiungi";

export default async function Aggiungi() {
  const utente = await utenteCorrente();
  if (!utente) redirect("/");

  return (
    <PaginaSemplice titolo="Aggiungi un libro" sottotitolo="Inquadra il codice a barre. Il resto si scrive da sé.">
      {/* La chiave Google viaggia fino al browser solo per chi ha fatto l'accesso:
          la ricerca su Google Books parte dal telefono (dal server Vercel Google
          risponde 503) e senza chiave finisce nella quota anonima, sempre esaurita. */}
      <ModuloAggiungi chiaveGoogle={process.env.GOOGLE_BOOKS_API_KEY ?? null} />
    </PaginaSemplice>
  );
}
