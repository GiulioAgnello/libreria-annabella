"use client";

/**
 * La riga di ricerca, filtri e ordinamento sopra un elenco.
 *
 * Non è più un modulo da inviare: non c'è nessun pulsante "Filtra" perché non
 * c'è niente da aspettare. Le righe sono già tutte nel browser, quindi ogni
 * lettera scritta e ogni tendina mossa ridisegnano l'elenco all'istante.
 *
 * Per lo stesso motivo non serve nessun ritardo alla scrittura: il "debounce"
 * esiste per non tempestare la rete di richieste mentre uno digita, e qui di
 * rete non ce n'è.
 *
 * I campi li mette chi la usa, così ogni schermata mostra solo i filtri che
 * hanno senso per lei; qui sta la parte comune — il pulsante che rimette tutto
 * a posto, che compare soltanto quando c'è qualcosa da rimettere a posto.
 */

export const CONTROLLO =
  "rounded-[9px] border border-tratto bg-superficie px-3 py-2 text-[14px] outline-none focus:border-inchiostro-3";

export default function BarraFiltri({
  attivi,
  azzera,
  children,
}: {
  attivi: boolean;
  azzera: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}

      {attivi && (
        <button
          type="button"
          onClick={azzera}
          className="rounded-[9px] border border-tratto px-4 py-2 text-[14px] text-inchiostro-2 transition hover:border-inchiostro-3"
        >
          Azzera
        </button>
      )}
    </div>
  );
}

/** Il selettore lista / griglia, uguale in tutte le schermate che ce l'hanno. */
export function SceltaVista({
  aCatalogo,
  cambia,
  colore,
}: {
  aCatalogo: boolean;
  cambia: (aCatalogo: boolean) => void;
  colore: string;
}) {
  return (
    <div className="flex gap-1.5 rounded-[9px] border border-tratto bg-superficie p-1 text-[13px]">
      {[
        { etichetta: "Lista", attivo: !aCatalogo, valore: false },
        { etichetta: "Catalogo", attivo: aCatalogo, valore: true },
      ].map((v) => (
        <button
          key={v.etichetta}
          type="button"
          onClick={() => cambia(v.valore)}
          className="rounded-[6px] px-3 py-1.5 transition"
          style={v.attivo ? { background: colore, color: "white" } : undefined}
        >
          {v.etichetta}
        </button>
      ))}
    </div>
  );
}
