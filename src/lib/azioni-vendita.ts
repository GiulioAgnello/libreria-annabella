"use server";

import { revalidatePath } from "next/cache";
import { clientServer } from "@/lib/supabase/server";

const OGGI = () => new Date().toISOString().slice(0, 10);

/** Registra la vendita di una copia: prezzo incassato, data, e il canale se noto. */
export async function segnaVenduta(id: string, formData: FormData) {
  const supabase = await clientServer();
  if (!supabase) return;

  const prezzoVendita = parseFloat(String(formData.get("prezzo_vendita") ?? "").replace(",", "."));
  if (!Number.isFinite(prezzoVendita)) return;

  const canale = String(formData.get("canale_vendita") ?? "").trim();

  await supabase
    .from("books")
    .update({
      stato: "venduta",
      prezzo_vendita: prezzoVendita,
      data_vendita: OGGI(),
      canale_vendita: canale || null,
    })
    .eq("id", id);

  revalidatePath("/vendita");
  revalidatePath("/vendita/magazzino");
  revalidatePath("/vendita/vendite");
  revalidatePath("/vendita/contabilita");
}

/** Mostra o nasconde una copia dalla vetrina pubblica. */
export async function segnaPubblico(id: string, pubblico: boolean) {
  const supabase = await clientServer();
  if (!supabase) return;

  await supabase.from("books").update({ pubblico }).eq("id", id);

  revalidatePath("/vendita/magazzino");
  revalidatePath("/vendita/vetrina");
}
