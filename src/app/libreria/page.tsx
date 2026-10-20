import Link from "next/link";
import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import Icona from "@/components/Icona";
import SchedinaLibro from "@/components/SchedinaLibro";
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
    { valore: stat.totale, etichetta: "in collezione", icona: "collezione", href: "/libreria/catalogo" },
    { valore: stat.daLeggere, etichetta: "da leggere", icona: "da-leggere", href: "/libreria/da-leggere" },
    {
      valore: stat.inLettura,
      etichetta: "in lettura",
      icona: "in-lettura",
      href: "/libreria/catalogo?stato=in%20lettura",
    },
    { valore: stat.letti, etichetta: "letti", icona: "letto", href: "/libreria/catalogo?stato=letto" },
    {
      valore: stat.prestiti,
      etichetta: "in prestito",
      icona: "biblioteca",
      href: "/libreria/catalogo?provenienza=biblioteca",
    },
    {
      valore: stat.audiolibri,
      etichetta: "audiolibri",
      icona: "audiolibro",
      href: "/libreria/catalogo?provenienza=audible",
    },
  ];

  return (
    <>
      <Intestazione
        titolo="La mia libreria"
        sottotitolo="Quanto hai letto, quanto hai risparmiato, che cosa leggerai adesso."
      />

      <div className="tessera mb-5 px-6 py-6">
        <div className="flex items-center gap-2 text-[12.5px] uppercase tracking-[0.1em] text-inchiostro-3">
          <Icona nome="salvadanaio" className="size-4 text-bosco" />
          Risparmio sull&apos;usato
        </div>
        <div className="numero mt-1 text-[34px] text-bosco">{EURO(stat.risparmio)}</div>
      </div>

      {/* Il conto della passione: quanto sono costati i libri tenuti per leggere,
          contro quanto ha reso rivendere gli altri. Se il saldo è positivo, il
          banchetto dell'usato si è pagato la libreria. */}
      <div className="tessera mb-5 px-6 py-5">
        <div className="flex items-center gap-2 text-[12.5px] uppercase tracking-[0.1em] text-inchiostro-3">
          <Icona nome="bilancia" className="size-4 text-bosco" />
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
            <div className={`numero text-[24px] ${saldo >= 0 ? "text-bosco" : "text-vermiglio"}`}>{EURO(saldo)}</div>
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
          <Link
            key={n.etichetta}
            href={n.href}
            className="tessera px-3 py-4 text-center transition hover:-translate-y-[2px] hover:border-inchiostro-3"
          >
            <Icona nome={n.icona} className="mx-auto mb-1.5 size-[18px] text-bosco/80" />
            <div className="numero text-[22px]">{n.valore}</div>
            <div className="mt-0.5 text-[11px] leading-tight text-inchiostro-3">{n.etichetta}</div>
          </Link>
        ))}
      </div>

      <section className="mt-6">
        <h3 className="mb-2.5 flex items-center gap-2 text-[15px] text-inchiostro-2">
          <Icona nome="in-lettura" className="size-[17px] text-bosco" />
          In lettura adesso
        </h3>
        {stat.inCorso.length === 0 ? (
          <p className="tessera px-5 py-4 text-[13.5px] text-inchiostro-3">Nessun libro aperto al momento.</p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {stat.inCorso.map((l) => (
              <SchedinaLibro key={l.id} libro={l} avanzamento />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[15px] text-inchiostro-2">
            <Icona nome="coda" className="size-[17px] text-bosco" />
            Prossimo in coda
          </h3>
          {stat.prossimo && (
            <Link href="/libreria/da-leggere" className="text-[12.5px] underline text-inchiostro-2">
              Tutta la coda →
            </Link>
          )}
        </div>
        {stat.prossimo ? (
          <div className="sm:max-w-[calc(50%-5px)]">
            <SchedinaLibro libro={stat.prossimo} etichetta="Il prossimo da aprire" />
          </div>
        ) : (
          <p className="tessera px-5 py-4 text-[13.5px] text-inchiostro-3">La coda è vuota.</p>
        )}
      </section>
    </>
  );
}
