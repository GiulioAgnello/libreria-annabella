/** Stato vuoto onesto: dice che cosa arriverà e quando. */
export default function Vuoto({ titolo, testo, fase }: { titolo: string; testo: string; fase?: string }) {
  return (
    <div className="tessera flex flex-col items-center justify-center px-6 py-14 text-center">
      <h3 className="text-[17px]">{titolo}</h3>
      <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-inchiostro-2">{testo}</p>
      {fase && (
        <span className="mt-4 rounded-full border border-tratto px-3 py-1 text-[11.5px] uppercase tracking-[0.08em] text-inchiostro-3">
          {fase}
        </span>
      )}
    </div>
  );
}
