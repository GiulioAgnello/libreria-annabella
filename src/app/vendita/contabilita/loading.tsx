import { Attesa, Barra, IntestazioneVuota } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <Attesa>
      <IntestazioneVuota />

      <div className="tessera overflow-hidden">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-tratto" : ""}`}
          >
            <Barra className="h-[14px] w-[46%]" />
            <Barra className="h-[14px] w-[76px]" />
          </div>
        ))}
      </div>
    </Attesa>
  );
}
