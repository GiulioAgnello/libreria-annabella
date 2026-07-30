import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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

/** L'utente collegato, oppure null. */
export async function utenteCorrente() {
  const supabase = await clientServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
