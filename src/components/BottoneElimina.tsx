"use client";

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
      className="rounded-[9px] border border-vermiglio/40 px-4 py-2.5 text-[13.5px] font-medium text-vermiglio transition hover:bg-vermiglio/10"
    >
      Elimina libro
    </button>
  );
}
