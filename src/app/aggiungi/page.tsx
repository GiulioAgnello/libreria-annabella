import { redirect } from "next/navigation";
import PaginaSemplice from "@/components/PaginaSemplice";
import { utenteCorrente } from "@/lib/supabase/server";
import ModuloAggiungi from "./ModuloAggiungi";

export default async function Aggiungi() {
  const utente = await utenteCorrente();
  if (!utente) redirect("/");

  return (
    <PaginaSemplice titolo="Aggiungi un libro" sottotitolo="Inquadra il codice a barre. Il resto si scrive da sé.">
      <ModuloAggiungi />
    </PaginaSemplice>
  );
}
