"use client";

import { createBrowserClient } from "@supabase/ssr";
import { CHIAVE_SUPABASE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./config";

/** Client per il browser. Restituisce null se le credenziali non ci sono ancora. */
export function clientBrowser() {
  if (!SUPABASE_CONFIGURATO) return null;
  return createBrowserClient(URL_SUPABASE, CHIAVE_SUPABASE);
}
