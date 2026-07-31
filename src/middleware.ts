import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CHIAVE_SUPABASE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "@/lib/supabase/config";

/**
 * Rinnova la sessione ad ogni visita. Senza questo passaggio, il token di accesso
 * scade dopo un'ora e nessuno lo rinnova finché non torni a fare login — è la causa
 * più comune del "mi chiede l'accesso troppo spesso" con Supabase su Next.js.
 */
export async function middleware(request: NextRequest) {
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

  // La chiamata da sola basta: se il token è scaduto, lo rinnova usando il refresh
  // token nel cookie e riscrive i cookie aggiornati nella risposta.
  await supabase.auth.getUser();

  return risposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
