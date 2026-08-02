import { ACCESSO_LOCALE } from "@/lib/supabase/servizio";

/**
 * Promemoria che si sta guardando il computer e non il sito vero.
 *
 * Con l'accesso automatico le due cose diventano indistinguibili a occhio — stessi
 * dati, stesso aspetto, nessuna schermata di accesso a fare da confine. Ed è
 * proprio quando sono identiche che si fa il danno: si prova una modifica
 * credendo di essere in locale mentre si è sul sito che usa Annabella.
 *
 * Sta in basso a sinistra, non intercetta i clic e in produzione non viene
 * nemmeno disegnato.
 */
export default function SegnoLocale() {
  if (!ACCESSO_LOCALE) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none fixed bottom-2 left-2 z-50 select-none rounded-[6px] border border-tratto bg-superficie/85 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-inchiostro-3 shadow-sm"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      locale · accesso automatico
    </span>
  );
}
