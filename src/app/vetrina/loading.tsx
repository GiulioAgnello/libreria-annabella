import Sfondo from "@/components/Sfondo";
import { Attesa, Barra, GrigliaCopertine } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <main className="mx-auto min-h-dvh max-w-[860px] px-4 py-8 md:px-8 md:py-12" data-area="vendita">
      <Sfondo forte />

      <Attesa>
        <header className="mb-8 flex flex-col items-center">
          <Barra className="size-[26px] rounded-full" />
          <Barra className="mt-3 h-[24px] w-[120px]" />
          <Barra className="mt-2 h-[13px] w-[330px] max-w-[85%]" />
        </header>

        <GrigliaCopertine quante={8} />
      </Attesa>
    </main>
  );
}
