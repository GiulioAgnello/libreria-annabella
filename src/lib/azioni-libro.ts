"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { clientServer, utenteCorrente } from "@/lib/supabase/server";

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
  const utente = await utenteCorrente();
  if (!utente) return null;

  const supabase = await clientServer();
  if (!supabase) return null;

  const { data } = await supabase.from("books").select("*").eq("id", id).eq("utente", utente.id).single();

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

  redirect(`/libro/${id}?salvato=1`, RedirectType.replace);
}

/**
 * Elimina definitivamente una copia dal catalogo.
 *
 * `ritorno` è la lista da cui si era arrivati: dopo aver cancellato una copia
 * venduta si finisce nello storico, non nel magazzino.
 */
export async function cancellaLibro(id: string, ritorno: string) {
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

  redirect(ritorno, RedirectType.replace);
}

/**
 * Sposta una copia da un'area all'altra — libreria personale ↔ compravendita —
 * senza cancellarla e reinserirla: restano dati, prezzi, copertina e note.
 *
 * - verso la compravendita: entra in magazzino, non in vetrina (va messa
 *   pubblica a mano, quando ha un prezzo richiesto);
 * - verso la libreria: va in fondo alla coda di lettura. Si usa il massimo e non
 *   il conteggio, perché dopo spostamenti e cancellazioni le posizioni possono
 *   avere dei buchi e il conteggio finirebbe su un numero già occupato.
 *
 * Una copia già venduta non si sposta: non è più di Annabella.
 */
export async function spostaLibro(id: string, verso: "personale" | "vendita") {
  const utente = await utenteCorrente();
  const supabase = await clientServer();
  if (!utente || !supabase) return;

  const { data: libro } = await supabase
    .from("books")
    .select("area, stato")
    .eq("id", id)
    .eq("utente", utente.id)
    .single();
  if (!libro || libro.area === verso || libro.stato === "venduta") redirect(`/libro/${id}`);

  const patch: Record<string, unknown> = { area: verso };

  if (verso === "vendita") {
    patch.stato = "in magazzino";
    patch.pubblico = false;
    patch.posizione_coda = null;
    // Un libro da rivendere non è più tra quelli da leggere in questo periodo.
    patch.tbr_aggiunto = null;
  } else {
    const { data: ultimo } = await supabase
      .from("books")
      .select("posizione_coda")
      .eq("utente", utente.id)
      .eq("area", "personale")
      .not("posizione_coda", "is", null)
      .order("posizione_coda", { ascending: false })
      .limit(1)
      .maybeSingle();
    patch.posizione_coda = (ultimo?.posizione_coda ?? 0) + 1;
    patch.pubblico = false;
  }

  await supabase.from("books").update(patch).eq("id", id).eq("utente", utente.id);

  [
    "/",
    `/libro/${id}`,
    "/libreria",
    "/libreria/catalogo",
    "/libreria/da-leggere",
    "/vendita",
    "/vendita/magazzino",
    "/vendita/vendite",
    "/vendita/contabilita",
    "/vetrina",
  ].forEach((p) => revalidatePath(p));

  redirect(`/libro/${id}?spostato=1`, RedirectType.replace);
}
