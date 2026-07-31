"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientServer } from "@/lib/supabase/server";

export type LibroCompleto = {
  id: string;
  area: "personale" | "vendita";
  isbn: string | null;
  titolo: string;
  sottotitolo: string | null;
  autori: string[];
  editore: string | null;
  anno: number | null;
  lingua: string | null;
  pagine: number | null;
  copertina_url: string | null;
  generi: string[];
  formato: string | null;
  condizione: string | null;
  prezzo_pagato: number | null;
  prezzo_copertina: number | null;
  risparmio: number | null;
  provenienza: string;
  canale_acquisto: string | null;
  data_acquisto: string | null;
  note: string | null;
  // area personale
  stato_lettura: string;
  voto: number | null;
  recensione: string | null;
  data_inizio: string | null;
  data_fine: string | null;
  pagina_attuale: number | null;
  // area vendita
  stato: string;
  prezzo_richiesto: number | null;
  prezzo_vendita: number | null;
  data_vendita: string | null;
  canale_vendita: string | null;
  spese: number | null;
  pubblico: boolean;
};

/** Recupera un libro (di qualunque area) di proprietà dell'utente collegato. */
export async function dettaglioLibro(id: string): Promise<LibroCompleto | null> {
  const supabase = await clientServer();
  if (!supabase) return null;

  const { data: utente } = await supabase.auth.getUser();
  if (!utente.user) return null;

  const { data } = await supabase.from("books").select("*").eq("id", id).eq("utente", utente.user.id).single();

  return (data as LibroCompleto) ?? null;
}

function testo(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

function elenco(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function numero(v: FormDataEntryValue | null): number | null {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
}

function decimale(v: FormDataEntryValue | null): number | null {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Aggiorna tutte le caratteristiche modificabili di un libro, comuni e specifiche dell'area. */
export async function aggiornaLibro(id: string, area: "personale" | "vendita", formData: FormData) {
  const supabase = await clientServer();
  if (!supabase) return;

  const patch: Record<string, unknown> = {
    titolo: String(formData.get("titolo") ?? "").trim() || "Senza titolo",
    sottotitolo: testo(formData.get("sottotitolo")),
    autori: elenco(formData.get("autori")),
    editore: testo(formData.get("editore")),
    anno: numero(formData.get("anno")),
    lingua: testo(formData.get("lingua")),
    pagine: numero(formData.get("pagine")),
    generi: elenco(formData.get("generi")),
    formato: testo(formData.get("formato")),
    condizione: testo(formData.get("condizione")),
    provenienza: testo(formData.get("provenienza")) ?? "acquisto",
    canale_acquisto: testo(formData.get("canale_acquisto")),
    prezzo_pagato: decimale(formData.get("prezzo_pagato")),
    prezzo_copertina: decimale(formData.get("prezzo_copertina")),
    data_acquisto: testo(formData.get("data_acquisto")),
    note: testo(formData.get("note")),
  };

  if (area === "personale") {
    patch.stato_lettura = testo(formData.get("stato_lettura")) ?? "da leggere";
    patch.voto = numero(formData.get("voto"));
    patch.recensione = testo(formData.get("recensione"));
    patch.data_inizio = testo(formData.get("data_inizio"));
    patch.data_fine = testo(formData.get("data_fine"));
    patch.pagina_attuale = numero(formData.get("pagina_attuale"));
  } else {
    patch.stato = testo(formData.get("stato")) ?? "in magazzino";
    patch.prezzo_richiesto = decimale(formData.get("prezzo_richiesto"));
    patch.prezzo_vendita = decimale(formData.get("prezzo_vendita"));
    patch.data_vendita = testo(formData.get("data_vendita"));
    patch.canale_vendita = testo(formData.get("canale_vendita"));
    patch.spese = decimale(formData.get("spese")) ?? 0;
    patch.pubblico = formData.get("pubblico") === "on";
  }

  await supabase.from("books").update(patch).eq("id", id);

  revalidatePath(`/libro/${id}`);
  revalidatePath("/libreria");
  revalidatePath("/libreria/catalogo");
  revalidatePath("/libreria/da-leggere");
  revalidatePath("/vendita");
  revalidatePath("/vendita/magazzino");
  revalidatePath("/vendita/vendite");
  revalidatePath("/vendita/contabilita");
  revalidatePath("/vetrina");

  redirect(`/libro/${id}?salvato=1`);
}

/** Elimina definitivamente una copia dal catalogo. */
export async function cancellaLibro(id: string, area: "personale" | "vendita") {
  const supabase = await clientServer();
  if (!supabase) return;

  await supabase.from("books").delete().eq("id", id);

  revalidatePath("/libreria");
  revalidatePath("/libreria/catalogo");
  revalidatePath("/libreria/da-leggere");
  revalidatePath("/vendita");
  revalidatePath("/vendita/magazzino");
  revalidatePath("/vendita/vendite");
  revalidatePath("/vendita/contabilita");
  revalidatePath("/vetrina");

  redirect(area === "personale" ? "/libreria/catalogo" : "/vendita/magazzino");
}
