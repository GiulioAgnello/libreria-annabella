import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import Icona from "@/components/Icona";
import { codaLettura } from "@/lib/libri";
import { segnaStatoLettura, spostaCoda } from "@/lib/azioni-libri";

export default async function Pagina() {
  const libri = await codaLettura();

  if (libri.length === 0) {
    return (
      <>
        <Intestazione titolo="Da leggere" sottotitolo="La pila dei libri comprati e non ancora letti." />
        <Vuoto
          titolo="La coda è vuota"
          testo="Ogni libro segnato «da leggere» finirà qui, in cima quello che leggerai per primo."
        />
      </>
    );
  }

  return (
    <>
      <Intestazione titolo="Da leggere" sottotitolo="La pila dei libri comprati e non ancora letti. Il primo in cima è il prossimo." />

      <ol className="space-y-2">
        {libri.map((l, i) => (
          <li key={l.id} className="tessera flex items-center gap-3 px-4 py-3">
            <span className="numero w-6 shrink-0 text-center text-[15px] text-inchiostro-3">{i + 1}</span>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px]">{l.titolo}</div>
              {l.autori[0] && <div className="truncate text-[12.5px] text-inchiostro-3">{l.autori[0]}</div>}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <form action={spostaCoda.bind(null, l.id, "su")}>
                <button
                  type="submit"
                  disabled={i === 0}
                  aria-label="Sposta su"
                  className="grid size-7 place-items-center rounded-[7px] border border-tratto text-inchiostro-2 transition hover:border-inchiostro-3 disabled:opacity-30"
                >
                  <Icona nome="su" className="size-4" />
                </button>
              </form>
              <form action={spostaCoda.bind(null, l.id, "giu")}>
                <button
                  type="submit"
                  disabled={i === libri.length - 1}
                  aria-label="Sposta giù"
                  className="grid size-7 place-items-center rounded-[7px] border border-tratto text-inchiostro-2 transition hover:border-inchiostro-3 disabled:opacity-30"
                >
                  <Icona nome="giu" className="size-4" />
                </button>
              </form>
              <form action={segnaStatoLettura.bind(null, l.id, "in lettura")}>
                <button
                  type="submit"
                  className="ml-1.5 rounded-[7px] bg-bosco px-3 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-bosco-scuro"
                >
                  Inizia
                </button>
              </form>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
