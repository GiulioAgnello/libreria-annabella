/**
 * Le credenziali di Supabase.
 * Finché non esistono, l'applicazione parte lo stesso in modalità dimostrativa:
 * si vede tutta l'interfaccia, semplicemente senza dati salvati.
 */
export const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const CHIAVE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_CONFIGURATO = Boolean(URL_SUPABASE && CHIAVE_SUPABASE);
