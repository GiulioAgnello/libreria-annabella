import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import TogglePubblico from "@/components/TogglePubblico";
import { magazzinoVendita } from "@/lib/vendita";
import { segnaVenduta, segnaPubblico } from "@/lib/azioni-vendita";

const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));

export default async function Pagina() {
  const libri = await magazzinoVendita();

  return (
    <>
      <Intestazione titolo="Magazzino" sottotitolo="Le copie comprate per rivendere, ancora invendute." />

      {libri.length === 0 ? (
        <Vuoto titolo="Magazzino vuoto" testo="Ogni copia comprata per rivendere finirà qui, con costo, prezzo richiesto e giorni di giacenza." />
      ) : (
        <div className="tessera overflow-hidden">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-tratto text-left text-[11.5px] uppercase tracking-[0.06em] text-inchiostro-3">
                <th className="px-4 py-2.5 font-medium">Titolo</th>
                <th className="px-4 py-2.5 font-medium">Costo</th>
                <th className="px-4 py-2.5 font-medium">Richiesto</th>
                <th className="px-4 py-2.5 font-medium">Margine atteso</th>
                <th className="px-4 py-2.5 font-medium">Giacenza</th>
                <th className="px-4 py-2.5 font-medium">Vetrina</th>
                <th className="px-4 py-2.5 font-medium">Vendita</th>
              </tr>
            </thead>
            <tbody>
              {libri.map((l) => (
                <tr key={l.id} className="border-b border-tratto last:border-0">
                  <td className="px-4 py-2.5">
                    {l.titolo}
                    {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_pagato)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_richiesto)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.margineAtteso)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">
                    {l.giorniGiacenza != null ? `${l.giorniGiacenza} gg` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <TogglePubblico id={l.id} attuale={l.pubblico} azione={segnaPubblico} />
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={segnaVenduta.bind(null, l.id)} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        name="prezzo_vendita"
                        placeholder="€"
                        required
                        inputMode="decimal"
                        defaultValue={l.prezzo_richiesto ?? ""}
                        className="w-16 rounded-[7px] border border-tratto bg-superficie px-2 py-1 text-[12.5px] outline-none focus:border-inchiostro-3"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-[7px] px-2.5 py-1 text-[12px] font-medium text-white transition"
                        style={{ background: "#8b5ca8" }}
                      >
                        Venduto
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
