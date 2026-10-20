import { clientPubblico } from "@/lib/supabase/pubblico";

export type CopiaVetrina = {
  id: string;
  titolo: string;
  autori: string[];
  condizione: string | null;
  prezzo_richiesto: number | null;
  copertina_url: string | null;
};

/**
 * Le copie in vetrina, lette come le legge un cliente: senza sessione, solo
 * quello che la regola "vetrina pubblica" del database lascia vedere. La usano
 * sia la pagina pubblica sia l'anteprima dentro la compravendita, così
 * l'anteprima mostra esattamente ciò che vedono gli altri.
 */
export async function copiePubbliche(): Promise<CopiaVetrina[]> {
  const supabase = clientPubblico();
  if (!supabase) return [];

  const { data } = await supabase
    .from("books")
    .select("id, titolo, autori, condizione, prezzo_richiesto, copertina_url")
    .eq("area", "vendita")
    .eq("stato", "in magazzino")
    .eq("pubblico", true)
    .order("titolo", { ascending: true });

  return (data ?? []) as CopiaVetrina[];
}
