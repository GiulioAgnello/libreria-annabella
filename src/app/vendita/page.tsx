import Link from "next/link";
import Icona from "@/components/Icona";
import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import { statisticheVendita } from "@/lib/vendita";

const EURO = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default async function Pagina() {
  const stat = await statisticheVendita();
  const nessunDato = stat.inMagazzino === 0 && stat.vendute === 0;

  if (nessunDato) {
    return (
      <>
        <Intestazione titolo="Compravendita" sottotitolo="Utile, incassi, magazzino e copie ferme da troppo tempo." />
        <Vuoto
          titolo="Nessuna copia ancora"
          testo="Aggiungi una copia da rivendere: da qui in poi il cruscotto si riempie da solo."
          fase="Aggiungi la prima copia"
        />
      </>
    );
  }

  const NUMERI = [
    { valore: EURO(stat.utile), etichetta: "utile", href: "/vendita/contabilita", icona: "grafico" },
    { valore: EURO(stat.incassato), etichetta: "incassato", href: "/vendita/vendite", icona: "monete" },
    {
      valore: `${stat.ricarico.toFixed(1)}×`,
      etichetta: "ricarico medio",
      href: "/vendita/contabilita",
      icona: "percentuale",
    },
    {
      valore: EURO(stat.valoreMagazzino),
      etichetta: "valore magazzino",
      href: "/vendita/magazzino",
      icona: "portafoglio",
    },
    {
      valore: EURO(stat.margineMedio),
      etichetta: "margine medio/copia",
      href: "/vendita/contabilita",
      icona: "scontrino",
    },
    {
      valore: String(stat.inMagazzino),
      etichetta: "copie in magazzino",
      href: "/vendita/magazzino",
      icona: "magazzino",
    },
  ];

  return (
    <>
      <Intestazione titolo="Compravendita" sottotitolo="Utile, incassi, magazzino e copie ferme da troppo tempo." />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {NUMERI.map((n) => (
          <Link
            key={n.etichetta}
            href={n.href}
            className="tessera px-4 py-5 text-center transition hover:-translate-y-[2px] hover:border-inchiostro-3"
          >
            <Icona nome={n.icona} className="mx-auto mb-1.5 size-[18px] text-glicine-fondo/80" />
            <div className="numero text-[22px]" style={{ color: "#8b5ca8" }}>
              {n.valore}
            </div>
            <div className="mt-0.5 text-[11px] leading-tight text-inchiostro-3">{n.etichetta}</div>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="tessera px-5 py-5">
          <h3 className="flex items-center gap-2 text-[15px] text-inchiostro-2">
            <Icona nome="scontrino" className="size-4 text-glicine-fondo" />
            Ultime vendite
          </h3>
          {stat.ultimeVendite.length === 0 ? (
            <p className="mt-2 text-[13.5px] text-inchiostro-3">Ancora nessuna vendita registrata.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stat.ultimeVendite.map((l) => (
                <li key={l.id} className="flex justify-between text-[14px]">
                  <span className="truncate">{l.titolo}</span>
                  <span className="ml-2 shrink-0 text-inchiostro-3">{EURO(l.prezzo_vendita ?? 0)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/vendita/vendite" className="mt-3 inline-block text-[12.5px] underline text-inchiostro-2">
            Vedi tutte le vendite →
          </Link>
        </div>

        <div className="tessera px-5 py-5">
          <h3 className="flex items-center gap-2 text-[15px] text-inchiostro-2">
            <Icona nome="clessidra" className="size-4 text-glicine-fondo" />
            Ferme da più di 90 giorni
          </h3>
          {stat.ferme.length === 0 ? (
            <p className="mt-2 text-[13.5px] text-inchiostro-3">Niente di fermo da troppo tempo.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stat.ferme.slice(0, 5).map((l) => (
                <li key={l.id} className="flex justify-between text-[14px]">
                  <span className="truncate">{l.titolo}</span>
                  <span className="ml-2 shrink-0 text-inchiostro-3">{l.giorniGiacenza} gg</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/vendita/magazzino" className="mt-3 inline-block text-[12.5px] underline text-inchiostro-2">
            Vedi il magazzino →
          </Link>
        </div>
      </div>
    </>
  );
}
