import { Attesa, DueRiquadri, IntestazioneVuota, TessereNumeriche } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <Attesa>
      <IntestazioneVuota />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="tessera px-4 py-5">
            <div className="mx-auto h-[22px] w-[86px] rounded-[4px] bg-tratto" />
            <div className="mx-auto mt-2 h-[11px] w-[104px] rounded-[4px] bg-tratto" />
          </div>
        ))}
      </div>

      <DueRiquadri />
    </Attesa>
  );
}
