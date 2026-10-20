"use server";

import { revalidatePath } from "next/cache";
import { clientServer, utenteCorrente } from "@/lib/supabase/server";

/** Mette un libro della libreria nella TBR (o lo toglie). */
async function imposta(id: string, dentro: boolean) {
  const utente = await utenteCorrente();
  const supabase = await clientServer();
  if (!utente || !supabase) return;

  await supabase
    .from("books")
    .update({ tbr_aggiunto: dentro ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("utente", utente.id)
    .eq("area", "personale");

  revalidatePath("/libreria/tbr");
  revalidatePath("/libreria");
}

export async function aggiungiTbr(id: string) {
  await imposta(id, true);
}

export async function togliTbr(id: string) {
  await imposta(id, false);
}
