import Intestazione from "@/components/Intestazione";
import Sfondo from "@/components/Sfondo";
import BottoneIndietro from "@/components/BottoneIndietro";

/** Guscio leggero per le pagine che non appartengono a nessuna delle due aree. */
export default function PaginaSemplice({
  titolo,
  sottotitolo,
  children,
}: {
  titolo: string;
  sottotitolo: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-dvh max-w-[860px] px-4 py-6 md:px-8 md:py-9">
      <Sfondo />
      <BottoneIndietro href="/" testo="Ingresso" />
      <div className="mt-4">
        <Intestazione titolo={titolo} sottotitolo={sottotitolo} />
        {children}
      </div>
    </main>
  );
}
