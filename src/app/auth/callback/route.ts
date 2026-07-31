import { NextResponse } from "next/server";
import { clientServer } from "@/lib/supabase/server";

/** Scambia il codice del collegamento email con una sessione vera. */
export async function GET(richiesta: Request) {
  const { searchParams, origin } = new URL(richiesta.url);
  const code = searchParams.get("code");
  const prossimo = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await clientServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${prossimo}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/?errore=accesso`);
}
