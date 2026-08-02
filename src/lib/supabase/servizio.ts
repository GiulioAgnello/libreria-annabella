import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CHIAVE_SUPABASE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./config";

/**
 * Accesso automatico in sviluppo.
 *
 * Il database ha le regole per utente: `auth.uid() = utente`. Un finto utente
 * senza sessione vera non passerebbe quel controllo, e l'applicazione si aprirebbe
 * completamente vuota — peggio del login. Per entrare senza accedere e vedere
 * comunque i libri veri serve la chiave di servizio, l'unica che le regole non
 * filtrano.
 *
 * Da qui le tre precauzioni, in ordine di importanza:
 *
 *  1. `NODE_ENV !== "production"` — in produzione questo file non fa mai niente,
 *     nemmeno se la variabile fosse impostata per sbaglio su Vercel.
 *  2. la variabile NON ha il prefisso `NEXT_PUBLIC_`, quindi Next non la inserisce
 *     mai nel pacchetto che arriva al browser: resta sul server.
 *  3. vive in `.env.local`, che `.gitignore` esclude: non finisce su GitHub.
 *
 * Questo file non va importato da nessun componente con "use client".
 */

const CHIAVE_SERVIZIO = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Vero solo quando si sta lavorando in locale e la chiave di servizio c'è. */
export const ACCESSO_LOCALE =
  process.env.NODE_ENV !== "production" && SUPABASE_CONFIGURATO && Boolean(CHIAVE_SERVIZIO);

/**
 * Client che scavalca le regole per utente.
 * Niente sessione da conservare: ogni richiesta è a sé.
 */
export function clientServizio(): SupabaseClient {
  return createClient(URL_SUPABASE, CHIAVE_SERVIZIO || CHIAVE_SUPABASE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Chi sei quando entri senza accedere.
 *
 * Se `LIBRERIA_UTENTE_LOCALE` è impostata si usa quella. Altrimenti si chiede a
 * Supabase l'elenco degli utenti e si prende il primo: sul progetto di Annabella
 * c'è un account solo, quindi nel caso normale non serve configurare niente oltre
 * alla chiave.
 *
 * La promessa è tenuta a livello di modulo, non risolta ogni volta: la richiesta
 * parte una volta sola per avvio del server, non ad ogni pagina.
 */
let ricerca: Promise<string | null> | null = null;

export function utenteLocale(): Promise<string | null> {
  if (!ACCESSO_LOCALE) return Promise.resolve(null);

  const impostato = process.env.LIBRERIA_UTENTE_LOCALE;
  if (impostato) return Promise.resolve(impostato);

  ricerca ??= (async () => {
    try {
      const { data, error } = await clientServizio().auth.admin.listUsers({ perPage: 2 });
      if (error) throw error;

      const utenti = data?.users ?? [];
      if (utenti.length === 0) {
        console.warn(
          "\n[accesso locale] Il progetto Supabase non ha nessun utente.\n" +
            "                 Creane uno dal pannello (Authentication → Users) oppure\n" +
            "                 togli SUPABASE_SERVICE_ROLE_KEY da .env.local per tornare al login.\n",
        );
        return null;
      }

      if (utenti.length > 1) {
        console.warn(
          `\n[accesso locale] Ci sono più utenti: uso ${utenti[0].email}.\n` +
            "                 Per sceglierne un altro metti LIBRERIA_UTENTE_LOCALE in .env.local.\n",
        );
      } else {
        console.log(`[accesso locale] Attivo come ${utenti[0].email} — nessun login richiesto.`);
      }

      return utenti[0].id;
    } catch (e) {
      console.error(
        "\n[accesso locale] Non sono riuscito a leggere l'utente da Supabase.\n" +
          "                 Controlla che SUPABASE_SERVICE_ROLE_KEY sia la chiave `service_role`\n" +
          "                 (Project Settings → API), non quella pubblica.\n" +
          `                 Dettaglio: ${e instanceof Error ? e.message : String(e)}\n`,
      );
      // Azzerata: al prossimo tentativo si riprova, invece di restare
      // bloccati su un errore magari solo di rete.
      ricerca = null;
      return null;
    }
  })();

  return ricerca;
}
