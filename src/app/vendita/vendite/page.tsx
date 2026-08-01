import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import { venditeStorico } from "@/lib/vendita";

const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));
const PERCENTO = (n: number | null) => (n == null ? "—" : `${(n * 100).toFixed(0)}%`);

export default async function Pagina() {
  const vendite = await venditeStorico();

  return (
    <>
      <Intestazione titolo="Vendite" sottotitolo="Ogni vendita con il suo margine e il suo ROI." />

      {vendite.length === 0 ? (
        <Vuoto titolo="Nessuna vendita registrata" testo="Segna una copia come venduta dal magazzino: comparirà qui con margine e ROI già calcolati." />
      ) : (
        <div className="tessera overflow-hidden">
          {/* Sei colonne non stanno in uno schermo da telefono: senza questo
              involucro venivano tagliate e diventavano irraggiungibili. Adesso
              la tabella scorre di lato per conto suo, senza spostare la pagina. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13.5px]">
            <thead>
              <tr className="border-b border-tratto text-left text-[11.5px] uppercase tracking-[0.06em] text-inchiostro-3">
                <th className="px-4 py-2.5 font-medium">Titolo</th>
                <th className="px-4 py-2.5 font-medium">Pagato</th>
                <th className="px-4 py-2.5 font-medium">Venduto</th>
                <th className="px-4 py-2.5 font-medium">Margine</th>
                <th className="px-4 py-2.5 font-medium">ROI</th>
                <th className="px-4 py-2.5 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {vendite.map((l) => (
                <tr key={l.id} className="border-b border-tratto last:border-0">
                  <td className="px-4 py-2.5">
                    {l.titolo}
                    {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_pagato)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_vendita)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.margine)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{PERCENTO(l.roi)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-3">{l.data_vendita ?? "—"}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
