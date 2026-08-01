import { Attesa, Barra, DueRiquadri, IntestazioneVuota, TessereNumeriche } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <Attesa>
      <IntestazioneVuota />

      <div className="tessera mb-5 px-6 py-6">
        <Barra className="h-[12px] w-[165px]" />
        <Barra className="mt-3 h-[34px] w-[190px]" />
      </div>

      <TessereNumeriche quante={6} />
      <DueRiquadri />
    </Attesa>
  );
}
