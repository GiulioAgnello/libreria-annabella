import Intestazione from "@/components/Intestazione";
import Icona from "@/components/Icona";
import SchedinaLibro from "@/components/SchedinaLibro";
import SceltaTbr from "@/components/SceltaTbr";
import { tbrLibreria } from "@/lib/libri";
import { togliTbr } from "@/lib/azioni-tbr";

/**
 * TBR — "to be read": i libri che Annabella ha scelto di leggere in questo
 * periodo. Diversa dalla coda "Da leggere", che è tutta la pila in ordine di
 * priorità: qui c'è solo la selezione del momento, scelta a mano col "+".
 */
export default async function Pagina() {
  const { tbr, candidati } = await tbrLibreria();
  const letti = tbr.filter((l) => l.stato_lettura === "letto").length;

  return (
    <>
      <Intestazione titolo="TBR" sottotitolo="I libri che hai scelto di leggere in questo periodo." />

      {tbr.length > 0 && (
        <div className="tessera mb-5 px-5 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-inchiostro-2">Avanzamento della TBR</span>
            <span className="numero text-[15px] text-bosco">
              {letti} di {tbr.length} letti
            </span>
          </div>
          <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-tratto/60">
            <div className="h-full rounded-full bg-bosco" style={{ width: `${(letti / tbr.length) * 100}%` }} />
          </div>
        </div>
      )}

      <SceltaTbr candidati={candidati} />

      {tbr.length === 0 ? (
        <p className="tessera px-6 py-10 text-center text-[14px] text-inchiostro-2">
          La TBR è vuota. Premi &quot;Aggiungi libri alla TBR&quot; e scegli cosa leggere in questo periodo.
        </p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {tbr.map((l) => {
            const finito = l.stato_lettura === "letto";
            return (
              <div key={l.id} className={`relative ${finito ? "opacity-70" : ""}`}>
                <SchedinaLibro
                  className="pr-10"
                  libro={l}
                  avanzamento={l.stato_lettura === "in lettura"}
                  etichetta={finito ? "Letto ✓" : l.stato_lettura === "in lettura" ? "In lettura" : undefined}
                />
                <form action={togliTbr.bind(null, l.id)} className="absolute right-2 top-2">
                  <button
                    type="submit"
                    aria-label={`Togli "${l.titolo}" dalla TBR`}
                    title="Togli dalla TBR"
                    className="rounded-full bg-superficie/90 p-1.5 text-inchiostro-3 transition hover:bg-vermiglio/10 hover:text-vermiglio"
                  >
                    <Icona nome="chiudi" className="size-3.5" />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
