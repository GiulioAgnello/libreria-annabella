import { Attesa, Barra, GrigliaCopertine, IntestazioneVuota } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <Attesa>
      <IntestazioneVuota />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Barra className="h-[38px] w-[200px] rounded-[9px]" />
          <Barra className="h-[38px] w-[140px] rounded-[9px]" />
          <Barra className="h-[38px] w-[130px] rounded-[9px]" />
          <Barra className="h-[38px] w-[130px] rounded-[9px]" />
          <Barra className="h-[38px] w-[78px] rounded-[9px]" />
        </div>
        <Barra className="h-[38px] w-[150px] rounded-[9px]" />
      </div>

      <GrigliaCopertine quante={8} />
    </Attesa>
  );
}
