import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { CHIAVE_SUPABASE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./config";

/** Client lato server, con i cookie della sessione. Null se non ancora configurato. */
export async function clientServer() {
  if (!SUPABASE_CONFIGURATO) return null;
  const contenitore = await cookies();

  return createServerClient(URL_SUPABASE, CHIAVE_SUPABASE, {
    cookies: {
      getAll: () => contenitore.getAll(),
      setAll: (biscotti) => {
        try {
          biscotti.forEach(({ name, value, options }) => contenitore.set(name, value, options));
        } catch {
          // chiamato da un Server Component: il rinnovo avviene nel middleware
        }
      },
    },
  });
}

/**
 * L'utente collegato, oppure null.
 * `cache()` fa sì che, durante lo stesso caricamento di pagina, la verifica della sessione
 * (una richiesta di rete verso Supabase) avvenga una sola volta anche se più componenti
 * la richiedono — layout, pagina e helper dati altrimenti la ripeterebbero ciascuno per conto suo.
 */
export const utenteCorrente = cache(async () => {
  const supabase = await clientServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});
