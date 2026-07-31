import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import { statisticheVendita } from "@/lib/vendita";

const EURO = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default async function Pagina() {
  const stat = await statisticheVendita();

  if (stat.vendute === 0 && stat.inMagazzino === 0) {
    return (
      <>
        <Intestazione titolo="Contabilità" sottotitolo="Il vecchio foglio, senza più totali scritti a mano." />
        <Vuoto titolo="Conti da fare" testo="Totale speso, totale incassato, utile e ricarico: tutti calcolati, mai digitati." />
      </>
    );
  }

  const RIGHE = [
    ["Copie vendute", String(stat.vendute)],
    ["Speso per acquistarle", EURO(stat.speso)],
    ["Incassato", EURO(stat.incassato)],
    ["Utile", EURO(stat.utile)],
    ["Ricarico medio", `${stat.ricarico.toFixed(2)}×`],
    ["Margine medio per copia", EURO(stat.margineMedio)],
    ["Copie ancora in magazzino", String(stat.inMagazzino)],
    ["Valore del magazzino (se vendessi tutto al prezzo richiesto)", EURO(stat.valoreMagazzino)],
    ["Utile potenziale se vendessi tutto il magazzino", EURO(stat.valoreMagazzino - stat.costoMagazzino)],
  ];

  return (
    <>
      <Intestazione titolo="Contabilità" sottotitolo="Il vecchio foglio, senza più totali scritti a mano." />

      <div className="tessera overflow-hidden">
        {RIGHE.map(([etichetta, valore], i) => (
          <div
            key={etichetta}
            className={`flex items-center justify-between px-5 py-3.5 text-[14px] ${i > 0 ? "border-t border-tratto" : ""}`}
          >
            <span className="text-inchiostro-2">{etichetta}</span>
            <span className="numero" style={{ color: "#8b5ca8" }}>
              {valore}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
