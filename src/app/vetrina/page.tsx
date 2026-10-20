import Marchio from "@/components/Marchio";
import Sfondo from "@/components/Sfondo";
import GrigliaVetrina from "@/components/GrigliaVetrina";
import { copiePubbliche } from "@/lib/vetrina";

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

      <GrigliaVetrina copie={copie} />
    </main>
  );
}
