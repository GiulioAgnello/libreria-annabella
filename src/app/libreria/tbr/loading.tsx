import { Attesa, Elenco, IntestazioneVuota } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <Attesa>
      <IntestazioneVuota />
      <Elenco righe={7} />
    </Attesa>
  );
}
