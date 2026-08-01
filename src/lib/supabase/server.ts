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

export type UtenteSessione = { id: string; email: string | null };

/**
 * L'utente collegato, oppure null.
 *
 * Usa `getClaims()` e non `getUser()`. La differenza pesa: `getUser()` fa una vera
 * richiesta HTTP ai server Supabase ad ogni chiamata, quindi ogni pagina aspettava
 * un giro di rete completo prima ancora di iniziare a leggere i libri. `getClaims()`
 * verifica la firma del token in locale con la chiave pubblica del progetto: zero rete.
 *
 * Richiede che il progetto Supabase usi chiavi JWT asimmetriche
 * (Dashboard → Authentication → Signing Keys → migrare a ECC P-256).
 * Con le vecchie chiavi simmetriche la libreria ricade da sola su una chiamata di rete:
 * il codice resta corretto, semplicemente non guadagna velocità finché non migri.
 *
 * `cache()` deduplica comunque la chiamata dentro lo stesso render.
 */
export const utenteCorrente = cache(async (): Promise<UtenteSessione | null> => {
  const supabase = await clientServer();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || !sub) return null;

  const email = data.claims.email;
  return { id: sub, email: typeof email === "string" ? email : null };
});
