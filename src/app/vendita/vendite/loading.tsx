import { Attesa, IntestazioneVuota, Tabella } from "@/components/Scheletro";

export default function Attendi() {
  return (
    <Attesa>
      <IntestazioneVuota />
      <Tabella colonne={6} righe={8} />
    </Attesa>
  );
}
