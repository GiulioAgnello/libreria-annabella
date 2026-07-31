import Link from "next/link";
import Marchio from "@/components/Marchio";
import Sfondo from "@/components/Sfondo";
import { AREE, type Area } from "@/lib/aree";

const SCORCIATOIE = [
  { href: "/aggiungi", testo: "Aggiungi un libro" },
  { href: "/vetrina", testo: "Vetrina" },
  { href: "/impostazioni", testo: "Impostazioni" },
];

/** L'ingresso: due porte, nient'altro. */
export default function Ingresso() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-3 py-5">
      <Sfondo forte />

      <div className="w-full max-w-[600px]">
        <header className="mb-5 text-center sm:mb-8">
          <div className="mb-4 flex justify-center">
            <Marchio />
          </div>
          <h1 className="text-[21px] tracking-[0.03em] sm:text-[30px]">La Libreria di Annabella</h1>
          <p className="mt-2 text-[13px] tracking-[0.06em] text-inchiostro-3">Scegli dove entrare</p>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {(Object.keys(AREE) as Area[]).map((chiave) => {
            const area = AREE[chiave];
            return (
              <Link
                key={chiave}
                href={`/${chiave}`}
                className="tessera relative overflow-hidden rounded-[2px] px-3 py-5 text-center transition duration-200 hover:-translate-y-[3px] hover:border-inchiostro-3 sm:px-5 sm:py-8"
              >
                <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: area.filo }} />
                <h2 className="text-[19px] leading-tight sm:text-[29px]" style={{ color: area.colore }}>
                  {area.nome}
                </h2>
                <p className="mt-2 font-mincho text-[12px] italic leading-snug text-inchiostro-2 sm:mt-3 sm:text-[14.5px]">
                  {area.frase}
                </p>
                <span className="mt-3.5 flex flex-col items-center gap-0.5 border-t border-tratto pt-2.5 sm:mt-5 sm:flex-row sm:justify-center sm:gap-2 sm:pt-4">
                  <b className="numero text-[20px] font-normal sm:text-[24px]" style={{ color: area.colore }}>
                    0
                  </b>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-inchiostro-3 sm:text-[10px]">
                    libri inseriti
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <nav className="mt-4 flex flex-wrap justify-center gap-1.5 sm:mt-6 sm:gap-2">
          {SCORCIATOIE.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="rounded-[10px] border border-tratto bg-superficie/85 px-3 py-1.5 text-[12.5px] transition hover:border-inchiostro-3 sm:px-4 sm:py-2 sm:text-[14px]"
            >
              {v.testo}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
