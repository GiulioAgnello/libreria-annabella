import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CHIAVE_SUPABASE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "@/lib/supabase/config";

/**
 * Rinnova la sessione ad ogni visita. Senza questo passaggio, il token di accesso
 * scade dopo un'ora e nessuno lo rinnova finché non torni a fare login — è la causa
 * più comune del "mi chiede l'accesso troppo spesso" con Supabase su Next.js.
 *
 * Il file si chiamava `middleware.ts`: da Next 16 la convenzione è `proxy.ts`,
 * con la funzione rinominata di conseguenza. Il comportamento è identico.
 */
export async function proxy(request: NextRequest) {
  let risposta = NextResponse.next({ request });

  if (!SUPABASE_CONFIGURATO) return risposta;

  const supabase = createServerClient(URL_SUPABASE, CHIAVE_SUPABASE, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        risposta = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => risposta.cookies.set(name, value, options));
      },
    },
  });

  // `getClaims()` legge la sessione dai cookie e — se il token è scaduto — lo rinnova
  // col refresh token, riscrivendo i cookie aggiornati nella risposta: il comportamento
  // che ci serve resta identico. La differenza è che quando il token è ancora valido
  // (cioè quasi sempre) la firma viene verificata in locale, senza parlare con Supabase.
  // Prima, `getUser()` faceva un giro di rete completo su ogni singola richiesta.
  await supabase.auth.getClaims();

  return risposta;
}

export const config = {
  matcher: [
    /*
     * Il rinnovo della sessione serve solo alle pagine che leggono i cookie.
     * Restano fuori:
     *  - gli asset e le rotte interne di Next (_next/*, favicon, immagini, manifest)
     *  - /api/*, che apre da sé il proprio client Supabase quando gli serve
     *  - /vetrina, pagina pubblica che non ha nessuna sessione da rinnovare
     * Ogni percorso escluso è un giro di rete e una funzione serverless in meno.
     */
    "/((?!_next/|api/|vetrina|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
