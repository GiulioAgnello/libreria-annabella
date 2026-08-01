/**
 * I mattoncini delle schermate di attesa.
 *
 * Servono a due cose, e la seconda vale più della prima.
 *
 * 1. Dare una reazione immediata al clic. Duecento millisecondi in cui non
 *    succede niente si leggono come "si è bloccato"; gli stessi duecento
 *    millisecondi con la forma della pagina già disegnata si leggono come
 *    "sta arrivando".
 *
 * 2. Riaccendere il precaricamento. In App Router `<Link>` precarica le
 *    pagine quando entrano nello schermo, ma per le pagine dinamiche — e qui
 *    lo sono tutte, perché leggono i cookie della sessione — Next precarica
 *    soltanto fino al primo `loading.tsx`. Senza, non c'è niente da
 *    precaricare e ogni navigazione parte da zero al momento del clic.
 */

export function Barra({ className = "" }: { className?: string }) {
  return <div className={`rounded-[4px] bg-tratto ${className}`} />;
}

/** Il posto del titolo e del sottotitolo, con le stesse misure di `Intestazione`. */
export function IntestazioneVuota() {
  return (
    <header className="mb-6">
      <Barra className="h-[26px] w-[190px] max-w-[60%]" />
      <Barra className="mt-2.5 h-[14px] w-[330px] max-w-[85%]" />
    </header>
  );
}

/** Contenitore: tiene insieme il respiro dell'animazione per tutta la schermata. */
export function Attesa({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse" aria-hidden>
      {children}
    </div>
  );
}

/** Una fila di tessere numeriche, come i cruscotti delle due aree. */
export function TessereNumeriche({ quante = 6 }: { quante?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
      {Array.from({ length: quante }, (_, i) => (
        <div key={i} className="tessera px-3 py-4">
          <Barra className="mx-auto h-[22px] w-[42px]" />
          <Barra className="mx-auto mt-2 h-[11px] w-[58px]" />
        </div>
      ))}
    </div>
  );
}

/** Due riquadri affiancati, come "In lettura adesso" e "Prossimo in coda". */
export function DueRiquadri() {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="tessera px-5 py-5">
          <Barra className="h-[15px] w-[135px]" />
          <div className="mt-4 space-y-2.5">
            <Barra className="h-[14px] w-[85%]" />
            <Barra className="h-[14px] w-[62%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** La griglia delle copertine: catalogo, magazzino, vetrina. */
export function GrigliaCopertine({ quante = 8 }: { quante?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: quante }, (_, i) => (
        <div key={i} className="tessera overflow-hidden">
          <div className="aspect-[2/3] bg-tratto/60" />
          <div className="space-y-2 px-3 py-3">
            <Barra className="h-[13px] w-[92%]" />
            <Barra className="h-[12px] w-[58%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Una tabella in attesa, con il numero di colonne della schermata vera. */
export function Tabella({ colonne, righe = 8 }: { colonne: number; righe?: number }) {
  return (
    <div className="tessera overflow-hidden">
      <div className="flex gap-4 border-b border-tratto px-4 py-3">
        {Array.from({ length: colonne }, (_, i) => (
          <Barra key={i} className="h-[11px] flex-1" />
        ))}
      </div>
      {Array.from({ length: righe }, (_, r) => (
        <div key={r} className="flex gap-4 border-b border-tratto px-4 py-3.5 last:border-0">
          {Array.from({ length: colonne }, (_, c) => (
            <Barra key={c} className={`h-[13px] flex-1 ${c === 0 ? "" : "opacity-60"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Un elenco di righe alte, come la coda di lettura. */
export function Elenco({ righe = 6 }: { righe?: number }) {
  return (
    <ol className="space-y-2">
      {Array.from({ length: righe }, (_, i) => (
        <li key={i} className="tessera flex items-center gap-3 px-4 py-3">
          <Barra className="size-6 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Barra className="h-[14px] w-[65%]" />
            <Barra className="h-[12px] w-[38%]" />
          </div>
          <Barra className="h-[28px] w-[74px] shrink-0 rounded-[7px]" />
        </li>
      ))}
    </ol>
  );
}
