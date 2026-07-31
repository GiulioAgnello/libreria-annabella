import Link from "next/link";
import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import TogglePubblico from "@/components/TogglePubblico";
import { magazzinoVendita } from "@/lib/vendita";
import { segnaVenduta, segnaPubblico } from "@/lib/azioni-vendita";

const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));

export default async function Pagina({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const { vista } = await searchParams;
  const aCatalogo = vista === "catalogo";
  const libri = await magazzinoVendita();

  return (
    <>
      <Intestazione titolo="Magazzino" sottotitolo="Le copie comprate per rivendere, ancora invendute." />

      {libri.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="flex gap-1.5 rounded-[9px] border border-tratto bg-superficie p-1 text-[13px]">
            <Link
              href="?"
              className={`rounded-[6px] px-3 py-1.5 transition ${!aCatalogo ? "bg-bosco text-white" : "text-inchiostro-2"}`}
            >
              Lista
            </Link>
            <Link
              href="?vista=catalogo"
              className={`rounded-[6px] px-3 py-1.5 transition ${aCatalogo ? "bg-bosco text-white" : "text-inchiostro-2"}`}
            >
              Catalogo
            </Link>
          </div>
        </div>
      )}

      {libri.length === 0 ? (
        <Vuoto titolo="Magazzino vuoto" testo="Ogni copia comprata per rivendere finirà qui, con costo, prezzo richiesto e giorni di giacenza." />
      ) : aCatalogo ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {libri.map((l) => (
            <div key={l.id} className="tessera flex flex-col overflow-hidden">
              <Link href={`/libro/${l.id}`} className="flex flex-1 flex-col">
                <div className="flex aspect-[2/3] items-center justify-center bg-glicine-tenue">
                  {l.copertina_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.copertina_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mincho text-[13px] text-glicine-fondo">senza copertina</span>
                  )}
                </div>
                <div className="px-3 pt-3">
                  <div className="line-clamp-2 text-[13.5px] leading-snug hover:underline">{l.titolo}</div>
                  {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                </div>
              </Link>
              <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
                <div className="flex items-center justify-between text-[12px] text-inchiostro-2">
                  <span>{EURO(l.prezzo_richiesto)}</span>
                  <span>{l.giorniGiacenza != null ? `${l.giorniGiacenza} gg` : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <TogglePubblico id={l.id} attuale={l.pubblico} azione={segnaPubblico} />
                </div>
                <form action={segnaVenduta.bind(null, l.id)} className="mt-1 flex items-center gap-1.5">
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
              </div>
            </div>
          ))}
        </div>
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
                    <Link href={`/libro/${l.id}`} className="hover:underline">
                      {l.titolo}
                    </Link>
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
