/**
 * Il pallino che distingue una copia prenotata da una libera.
 *
 * Le prenotate stanno nella stessa lista delle altre — sono ancora merce in
 * casa — ma non sono più disponibili: senza un segno visibile si finirebbe per
 * prometterle due volte.
 */
export default function EtichettaStato({ stato }: { stato: string }) {
  if (stato !== "prenotata") return null;

  return (
    <span className="ml-1.5 inline-block whitespace-nowrap rounded-[5px] bg-glicine-tenue px-1.5 py-0.5 align-middle text-[10.5px] uppercase tracking-[0.08em] text-glicine-fondo">
      prenotata
    </span>
  );
}
