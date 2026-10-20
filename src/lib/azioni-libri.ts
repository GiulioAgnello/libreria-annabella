"use server";

import { revalidatePath } from "next/cache";
import { clientServer, utenteCorrente } from "@/lib/supabase/server";

const OGGI = () => new Date().toISOString().slice(0, 10);

/** Cambia lo stato di lettura di un libro (da leggere → in lettura → letto, o abbandonato). */
export async function segnaStatoLettura(id: string, nuovoStato: string) {
  const supabase = await clientServer();
  if (!supabase) return;

  const patch: Record<string, unknown> = { stato_lettura: nuovoStato };
  if (nuovoStato === "in lettura") patch.data_inizio = OGGI();
  if (nuovoStato === "letto") patch.data_fine = OGGI();

  await supabase.from("books").update(patch).eq("id", id);

  revalidatePath("/libreria");
  revalidatePath("/libreria/catalogo");
  revalidatePath("/libreria/da-leggere");
  revalidatePath("/libreria/tbr");
}

/** Sposta un libro su o giù di una posizione nella coda di lettura. */
export async function spostaCoda(id: string, direzione: "su" | "giu") {
  const supabase = await clientServer();
  if (!supabase) return;

  const utente = await utenteCorrente();
  if (!utente) return;

  const { data: lista } = await supabase
    .from("books")
    .select("id, posizione_coda")
    .eq("utente", utente.id)
    .eq("area", "personale")
    .eq("stato_lettura", "da leggere")
    .order("posizione_coda", { ascending: true });

  if (!lista) return;

  const indice = lista.findIndex((l) => l.id === id);
  if (indice === -1) return;

  const scambio = direzione === "su" ? indice - 1 : indice + 1;
  if (scambio < 0 || scambio >= lista.length) return;

  const a = lista[indice];
  const b = lista[scambio];

  await supabase.from("books").update({ posizione_coda: b.posizione_coda }).eq("id", a.id);
  await supabase.from("books").update({ posizione_coda: a.posizione_coda }).eq("id", b.id);

  revalidatePath("/libreria/da-leggere");
  revalidatePath("/libreria");
}

export type EsitoPagina = { ok: true; finito: boolean } | { ok: false; messaggio: string };

/**
 * Aggiorna la pagina a cui si è arrivati, dal cruscotto o dalla TBR, senza
 * aprire la scheda del libro. `totale` serve solo quando il libro non ha ancora
 * il numero di pagine: si chiede lì, una volta, e resta salvato.
 *
 * Arrivati all'ultima pagina il libro diventa "letto", con la data di oggi.
 */
export async function aggiornaPagina(id: string, pagina: number, totale?: number | null): Promise<EsitoPagina> {
  const utente = await utenteCorrente();
  const supabase = await clientServer();
  if (!utente || !supabase) return { ok: false, messaggio: "Sessione scaduta: ricarica la pagina." };

  if (!Number.isInteger(pagina) || pagina < 0) return { ok: false, messaggio: "Scrivi un numero di pagina valido." };

  const { data: libro } = await supabase
    .from("books")
    .select("pagine, stato_lettura, data_inizio")
    .eq("id", id)
    .eq("utente", utente.id)
    .single();
  if (!libro) return { ok: false, messaggio: "Libro non trovato." };

  const pagine = libro.pagine ?? (totale && totale > 0 ? Math.round(totale) : null);
  if (pagine && pagina > pagine) return { ok: false, messaggio: `Il libro ha ${pagine} pagine.` };

  const patch: Record<string, unknown> = { pagina_attuale: pagina };
  if (!libro.pagine && pagine) patch.pagine = pagine;

  // Chi segna una pagina sta leggendo: se il libro era ancora "da leggere", parte ora.
  if (pagina > 0 && libro.stato_lettura === "da leggere") {
    patch.stato_lettura = "in lettura";
    if (!libro.data_inizio) patch.data_inizio = OGGI();
  }

  const finito = Boolean(pagine && pagina === pagine);
  if (finito) {
    patch.stato_lettura = "letto";
    patch.data_fine = OGGI();
  }

  const { error } = await supabase.from("books").update(patch).eq("id", id).eq("utente", utente.id);
  if (error) return { ok: false, messaggio: "Non sono riuscito a salvare: " + error.message };

  ["/libreria", "/libreria/catalogo", "/libreria/da-leggere", "/libreria/tbr", `/libro/${id}`].forEach((p) =>
    revalidatePath(p),
  );
  return { ok: true, finito };
}
