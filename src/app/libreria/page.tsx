import Link from "next/link";
import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import { statisticheLibreria } from "@/lib/libri";

const EURO = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default async function Pagina() {
  const stat = await statisticheLibreria();

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
