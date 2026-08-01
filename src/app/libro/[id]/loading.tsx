import Sfondo from "@/components/Sfondo";
import { Attesa, Barra } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <main className="mx-auto min-h-dvh max-w-[860px] px-4 py-6 md:px-8 md:py-9">
      <Sfondo />

      <Attesa>
        <Barra className="h-[30px] w-[110px] rounded-[9px]" />

        <div className="mt-8">
          <Barra className="h-[26px] w-[280px] max-w-[70%]" />
          <Barra className="mt-2.5 h-[14px] w-[300px] max-w-[80%]" />
        </div>

        <div className="mt-6 flex gap-4">
          {/* la copertina */}
          <div className="h-[132px] w-[88px] shrink-0 rounded-[6px] border border-tratto bg-tratto/60" />

          <div className="flex-1 space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i}>
                <Barra className="h-[12px] w-[76px]" />
                <Barra className="mt-1.5 h-[42px] w-full rounded-[9px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <Barra className="h-[12px] w-[92px]" />
              <Barra className="mt-1.5 h-[42px] w-full rounded-[9px]" />
            </div>
          ))}
        </div>
      </Attesa>
    </main>
  );
}
