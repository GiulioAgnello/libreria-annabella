"use server";

import { revalidatePath } from "next/cache";
import { clientServer, utenteCorrente } from "@/lib/supabase/server";

/**
 * Salvataggio di un libro nuovo.
 *
 * Prima questa scrittura partiva dal browser: il modulo apriva un proprio client
 * Supabase, chiedeva `auth.getUser()` e faceva l'insert da lì. Funzionava, ma legava
 * l'inserimento all'esistenza di una sessione *nel browser* — e con l'accesso
 * automatico in locale quella sessione non c'è, quindi l'unica risposta possibile
 * sarebbe stata «sessione scaduta» su un'applicazione perfettamente funzionante.
 *
 * Spostandola qui, chi sei lo decide il server, in un punto solo, esattamente come
 * per tutte le altre scritture dell'applicazione. In più sparisce un giro di rete
 * (il `getUser()` prima dell'insert) e le pagine si aggiornano da sole.
 */

export type EsitoSalvataggio = { ok: true } | { ok: false; messaggio: string };

export async function salvaLibro(
  area: "personale" | "vendita",
  campi: Record<string, unknown>,
): Promise<EsitoSalvataggio> {
  const utente = await utenteCorrente();
  if (!utente) return { ok: false, messaggio: "Sessione scaduta: ricarica la pagina ed entra di nuovo." };

  const supabase = await clientServer();
  if (!supabase) return { ok: false, messaggio: "Il database non è collegato." };

  const titolo = typeof campi.titolo === "string" ? campi.titolo.trim() : "";
  if (!titolo) return { ok: false, messaggio: "Manca il titolo." };

  const payload: Record<string, unknown> = { ...campi, titolo, utente: utente.id, area };

  if (area === "personale") {
    // La coda di lettura è in ordine di arrivo: il nuovo libro va in fondo.
    const { count } = await supabase
      .from("books")
      .select("id", { count: "exact", head: true })
      .eq("utente", utente.id)
      .eq("area", "personale");
    payload.posizione_coda = (count ?? 0) + 1;
  }

  const { error } = await supabase.from("books").insert(payload);
  if (error) return { ok: false, messaggio: "Non sono riuscito a salvare: " + error.message };

  // Le schermate che contano o elencano i libri ora sono vecchie di un libro.
  const pagine =
    area === "personale"
      ? ["/", "/libreria", "/libreria/catalogo", "/libreria/da-leggere"]
      : ["/", "/vendita", "/vendita/magazzino", "/vendita/vendite", "/vendita/contabilita", "/vetrina"];
  pagine.forEach((p) => revalidatePath(p));

  return { ok: true };
}
