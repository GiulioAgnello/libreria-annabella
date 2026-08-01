import { Attesa, Barra, IntestazioneVuota, Tabella } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <Attesa>
      <IntestazioneVuota />

      <div className="mb-4 flex justify-end">
        <Barra className="h-[38px] w-[150px] rounded-[9px]" />
      </div>

      <Tabella colonne={7} righe={8} />
    </Attesa>
  );
}
