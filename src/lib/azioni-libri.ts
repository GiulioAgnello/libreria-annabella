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
