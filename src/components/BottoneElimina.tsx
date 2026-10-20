"use client";

import Icona from "@/components/Icona";

/** Pulsante di eliminazione con una conferma nativa, per non cancellare un libro per sbaglio. */
export default function BottoneElimina({ titolo }: { titolo: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(`Eliminare definitivamente "${titolo}"? L'azione non si può annullare.`)) {
          e.preventDefault();
        }
      }}
      className="inline-flex items-center gap-2 rounded-[9px] border border-vermiglio/40 px-4 py-2.5 text-[13.5px] font-medium text-vermiglio transition hover:bg-vermiglio/10"
    >
      <Icona nome="cestino" className="size-3.5" />
      Elimina libro
    </button>
  );
}
