import Marchio from "@/components/Marchio";
import Sfondo from "@/components/Sfondo";
import { clientPubblico } from "@/lib/supabase/pubblico";

const EURO = (n: number | null) => (n == null ? "" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));

type Copia = {
  id: string;
  titolo: string;
  autori: string[];
  condizione: string | null;
  prezzo_richiesto: number | null;
  copertina_url: string | null;
};

async function copiePubbliche(): Promise<Copia[]> {
  const supabase = clientPubblico();
  if (!supabase) return [];

  const { data } = await supabase
    .from("books")
    .select("id, titolo, autori, condizione, prezzo_richiesto, copertina_url")
    .eq("area", "vendita")
    .eq("stato", "in magazzino")
    .eq("pubblico", true)
    .order("titolo", { ascending: true });

  return (data ?? []) as Copia[];
}

export default async function Vetrina() {
  const copie = await copiePubbliche();

  return (
    <main className="mx-auto min-h-dvh max-w-[860px] px-4 py-8 md:px-8 md:py-12" data-area="vendita">
      <Sfondo forte />

      <header className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <Marchio dimensione={26} />
        </div>
        <h1 className="text-[24px]">Vetrina</h1>
        <p className="mt-1.5 text-[13.5px] text-inchiostro-2">Libri usati, in buone condizioni, pronti per una nuova casa.</p>
      </header>

      {copie.length === 0 ? (
        <p className="tessera px-6 py-12 text-center text-[14px] text-inchiostro-2">
          Non c&apos;è ancora nessuna copia in vetrina.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {copie.map((c) => (
            <div key={c.id} className="tessera flex flex-col overflow-hidden">
              <div className="flex aspect-[2/3] items-center justify-center bg-glicine-tenue">
                {c.copertina_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.copertina_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-mincho text-[13px] text-glicine-fondo">senza copertina</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 px-3 py-3">
                <div className="line-clamp-2 text-[13.5px] leading-snug">{c.titolo}</div>
                {c.autori[0] && <div className="text-[12px] text-inchiostro-3">{c.autori[0]}</div>}
                <div className="mt-auto flex items-center justify-between pt-2">
                  {c.condizione && (
                    <span className="text-[10.5px] uppercase tracking-[0.06em] text-inchiostro-3">{c.condizione}</span>
                  )}
                  <span className="numero text-[15px]" style={{ color: "#8b5ca8" }}>
                    {EURO(c.prezzo_richiesto)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
