"use server";

import { revalidatePath } from "next/cache";
import { clientServer, utenteCorrente } from "@/lib/supabase/server";

/**
 * Copertine caricate a mano.
 *
 * Servono per i libri che nessun catalogo online conosce (o di cui conosce una
 * copertina sbagliata): Annabella fa una foto al libro, o ne sceglie una dalla
 * galleria, e diventa la copertina di quella copia.
 *
 * I file vivono nello Storage di Supabase, nel bucket `copertine`, in una cartella
 * per utente: `<id utente>/<uuid>.jpg`. Le regole del bucket (vedi
 * `supabase/copertine.sql`) lasciano scrivere ognuno solo nella propria cartella;
 * la lettura invece è pubblica, perché le copertine compaiono anche in vetrina.
 *
 * L'immagine arriva già rimpicciolita dal browser (vedi `CaricaCopertina`): pochi
 * KB invece dei 3-4 MB di una foto del telefono, quindi sta comodamente dentro il
 * limite di 1 MB delle azioni server ed è veloce da scaricare negli elenchi.
 */

const BUCKET = "copertine";
const PESO_MASSIMO = 900 * 1024;

export type EsitoCopertina = { ok: true; url: string | null } | { ok: false; messaggio: string };

/** Il percorso dentro il bucket, se l'URL è una nostra copertina caricata. */
function percorsoNelBucket(url: string | null | undefined): string | null {
  if (!url) return null;
  const segno = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(segno);
  return i === -1 ? null : decodeURIComponent(url.slice(i + segno.length));
}

function pagineDaAggiornare(id: string) {
  [
    `/libro/${id}`,
    "/libreria",
    "/libreria/catalogo",
    "/libreria/da-leggere",
    "/vendita",
    "/vendita/magazzino",
    "/vendita/vendite",
    "/vetrina",
  ].forEach((p) => revalidatePath(p));
}

function spiegaErrore(messaggio: string): string {
  if (/bucket not found/i.test(messaggio)) {
    return "Lo spazio per le copertine non è ancora stato creato su Supabase (manca supabase/copertine.sql).";
  }
  if (/row-level security|unauthorized|403/i.test(messaggio)) {
    return "Supabase non mi lascia salvare la foto: controlla le regole del bucket copertine.";
  }
  return "Non sono riuscito a caricare la foto: " + messaggio;
}

/**
 * Carica una copertina.
 *
 * - con `libroId`: la foto diventa subito la copertina di quel libro e la
 *   vecchia, se era una caricata a mano, viene cancellata;
 * - senza (libro non ancora salvato): restituisce solo l'URL, che il modulo di
 *   inserimento salverà insieme al resto. `sostituisce` è la foto caricata un
 *   attimo prima nello stesso modulo, che a questo punto non serve più.
 */
export async function caricaCopertina(
  formData: FormData,
  libroId?: string | null,
  sostituisce?: string | null,
): Promise<EsitoCopertina> {
  const utente = await utenteCorrente();
  if (!utente) return { ok: false, messaggio: "Sessione scaduta: ricarica la pagina ed entra di nuovo." };

  const supabase = await clientServer();
  if (!supabase) return { ok: false, messaggio: "Il database non è collegato." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, messaggio: "Nessuna immagine ricevuta." };
  if (!file.type.startsWith("image/")) return { ok: false, messaggio: "Il file scelto non è un'immagine." };
  if (file.size > PESO_MASSIMO) return { ok: false, messaggio: "L'immagine è troppo pesante." };

  const estensione = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const percorso = `${utente.id}/${crypto.randomUUID()}.${estensione}`;

  const { error } = await supabase.storage.from(BUCKET).upload(percorso, file, {
    contentType: file.type,
    // Il nome è sempre nuovo, quindi il file non cambia mai: il browser può tenerlo un anno.
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { ok: false, messaggio: spiegaErrore(error.message) };

  const url = supabase.storage.from(BUCKET).getPublicUrl(percorso).data.publicUrl;

  let daCancellare = percorsoNelBucket(sostituisce);

  if (libroId) {
    const { data: prima } = await supabase
      .from("books")
      .select("copertina_url")
      .eq("id", libroId)
      .eq("utente", utente.id)
      .single();

    const { error: erroreLibro } = await supabase
      .from("books")
      .update({ copertina_url: url })
      .eq("id", libroId)
      .eq("utente", utente.id);

    if (erroreLibro) {
      await supabase.storage.from(BUCKET).remove([percorso]);
      return { ok: false, messaggio: "Non sono riuscito ad aggiornare il libro: " + erroreLibro.message };
    }

    daCancellare = percorsoNelBucket(prima?.copertina_url);
    pagineDaAggiornare(libroId);
  }

  // Solo file della propria cartella: un URL qualsiasi non deve poter cancellare niente.
  if (daCancellare?.startsWith(`${utente.id}/`)) {
    await supabase.storage.from(BUCKET).remove([daCancellare]);
  }

  return { ok: true, url };
}

/** Toglie la copertina a un libro (e cancella il file, se era caricato a mano). */
export async function rimuoviCopertina(libroId: string): Promise<EsitoCopertina> {
  const utente = await utenteCorrente();
  if (!utente) return { ok: false, messaggio: "Sessione scaduta: ricarica la pagina ed entra di nuovo." };

  const supabase = await clientServer();
  if (!supabase) return { ok: false, messaggio: "Il database non è collegato." };

  const { data: prima } = await supabase
    .from("books")
    .select("copertina_url")
    .eq("id", libroId)
    .eq("utente", utente.id)
    .single();

  const { error } = await supabase
    .from("books")
    .update({ copertina_url: null })
    .eq("id", libroId)
    .eq("utente", utente.id);
  if (error) return { ok: false, messaggio: "Non sono riuscito a togliere la copertina: " + error.message };

  const vecchio = percorsoNelBucket(prima?.copertina_url);
  if (vecchio?.startsWith(`${utente.id}/`)) {
    await supabase.storage.from(BUCKET).remove([vecchio]);
  }

  pagineDaAggiornare(libroId);
  return { ok: true, url: null };
}
