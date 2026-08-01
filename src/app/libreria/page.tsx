import Link from "next/link";
import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import { statisticheLibreria } from "@/lib/libri";
import { statisticheVendita } from "@/lib/vendita";

const EURO = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default async function Pagina() {
  /* Le due aree si leggono in parallelo: il saldo mette a confronto quanto è
     costata la libreria personale con quanto ha reso la compravendita. */
  const [stat, vendita] = await Promise.all([statisticheLibreria(), statisticheVendita()]);
  const saldo = vendita.utile - stat.speso;

  if (stat.totale === 0) {
    return (
      <>
        <Intestazione
          titolo="La mia libreria"
          sottotitolo="Quanto hai letto, quanto hai risparmiato, che cosa leggerai adesso."
        />
        <Vuoto
          titolo="Nessun libro ancora"
          testo="Aggiungine uno con lo scanner: da qui in poi il cruscotto si riempie da solo."
          fase="Aggiungi il primo libro"
        />
      </>
    );
  }

  const NUMERI = [
    { valore: stat.totale, etichetta: "in collezione" },
    { valore: stat.daLeggere, etichetta: "da leggere" },
    { valore: stat.inLettura, etichetta: "in lettura" },
    { valore: stat.letti, etichetta: "letti" },
    { valore: stat.prestiti, etichetta: "in prestito" },
    { valore: stat.audiolibri, etichetta: "audiolibri" },
  ];

  return (
    <>
      <Intestazione
        titolo="La mia libreria"
        sottotitolo="Quanto hai letto, quanto hai risparmiato, che cosa leggerai adesso."
      />

      <div className="tessera mb-5 px-6 py-6">
        <div className="text-[12.5px] uppercase tracking-[0.1em] text-inchiostro-3">Risparmio sull&apos;usato</div>
        <div className="numero mt-1 text-[34px] text-bosco">{EURO(stat.risparmio)}</div>
      </div>

      {/* Il conto della passione: quanto sono costati i libri tenuti per leggere,
          contro quanto ha reso rivendere gli altri. Se il saldo è positivo, il
          banchetto dell'usato si è pagato la libreria. */}
      <div className="tessera mb-5 px-6 py-5">
        <div className="text-[12.5px] uppercase tracking-[0.1em] text-inchiostro-3">
          Le rivendite pagano la libreria?
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-[12px] text-inchiostro-3">Speso per la libreria</div>
            <div className="numero text-[21px] text-inchiostro-2">− {EURO(stat.speso)}</div>
          </div>
          <div>
            <div className="text-[12px] text-inchiostro-3">Utile delle rivendite</div>
            <div className="numero text-[21px]" style={{ color: "#8b5ca8" }}>
              + {EURO(vendita.utile)}
            </div>
          </div>
          <div className="border-t border-tratto pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="text-[12px] text-inchiostro-3">Saldo</div>
            <div className={`numero text-[24px] ${saldo >= 0 ? "text-bosco" : "text-vermiglio"}`}>
              {EURO(saldo)}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed text-inchiostro-3">
          {saldo >= 0
            ? "Sei in attivo: rivendere ha coperto tutti i libri che ti sei tenuta, e avanza pure qualcosa."
            : `Ti mancano ${EURO(Math.abs(saldo))} perché le rivendite coprano i libri che ti sei tenuta.`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {NUMERI.map((n) => (
          <div key={n.etichetta} className="tessera px-3 py-4 text-center">
            <div className="numero text-[22px]">{n.valore}</div>
            <div className="mt-0.5 text-[11px] leading-tight text-inchiostro-3">{n.etichetta}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="tessera px-5 py-5">
          <h3 className="text-[15px] text-inchiostro-2">In lettura adesso</h3>
          {stat.inCorso.length === 0 ? (
            <p className="mt-2 text-[13.5px] text-inchiostro-3">Nessun libro aperto al momento.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stat.inCorso.map((l) => (
                <li key={l.id} className="text-[14px]">
                  {l.titolo}
                  {l.autori[0] && <span className="text-inchiostro-3"> — {l.autori[0]}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tessera px-5 py-5">
          <h3 className="text-[15px] text-inchiostro-2">Prossimo in coda</h3>
          {stat.prossimo ? (
            <>
              <p className="mt-2 text-[14px]">
                {stat.prossimo.titolo}
                {stat.prossimo.autori[0] && <span className="text-inchiostro-3"> — {stat.prossimo.autori[0]}</span>}
              </p>
              <Link href="/libreria/da-leggere" className="mt-3 inline-block text-[12.5px] underline text-inchiostro-2">
                Vedi tutta la coda →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-[13.5px] text-inchiostro-3">La coda è vuota.</p>
          )}
        </div>
      </div>
    </>
  );
}
