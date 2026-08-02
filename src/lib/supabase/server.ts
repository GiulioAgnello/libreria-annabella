import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { CHIAVE_SUPABASE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./config";
import { ACCESSO_LOCALE, clientServizio, utenteLocale } from "./servizio";

/** Client lato server, con i cookie della sessione. Null se non ancora configurato. */
export async function clientServer() {
  if (!SUPABASE_CONFIGURATO) return null;

  // In sviluppo con l'accesso automatico non ci sono cookie di sessione da leggere:
  // si lavora con la chiave di servizio, che le regole per utente non filtrano.
  // Il filtro sui dati resta comunque quello di sempre — ogni interrogazione
  // continua a fare `.eq("utente", …)` — quindi si vedono solo i libri di Annabella.
  if (ACCESSO_LOCALE) return clientServizio();

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
  // Accesso automatico in locale: nessuna sessione da verificare, sei già dentro.
  if (ACCESSO_LOCALE) {
    const id = await utenteLocale();
    return id ? { id, email: "accesso locale" } : null;
  }

  const supabase = await clientServer();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || !sub) return null;

  const email = data.claims.email;
  return { id: sub, email: typeof email === "string" ? email : null };
});
