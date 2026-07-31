import { createClient } from "@supabase/supabase-js";
import { CHIAVE_SUPABASE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./config";

/**
 * Client per le pagine pubbliche (la vetrina): nessun cookie, nessuna sessione.
 * La regola "vetrina pubblica" nel database fa già il lavoro di sicurezza —
 * chiunque, anche senza account, può leggere solo le copie marcate pubbliche.
 */
export function clientPubblico() {
  if (!SUPABASE_CONFIGURATO) return null;
  return createClient(URL_SUPABASE, CHIAVE_SUPABASE);
}
