"use client";

import { useState } from "react";
import { clientBrowser } from "@/lib/supabase/client";

export default function ModuloAccesso() {
  const [email, setEmail] = useState("");
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "errore">("fermo");
  const [messaggio, setMessaggio] = useState("");

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    const supabase = clientBrowser();
    if (!supabase) return;

    setStato("invio");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (error) {
      setStato("errore");
      setMessaggio(error.message);
    } else {
      setStato("fatto");
    }
  }

  if (stato === "fatto") {
    return (
      <p className="mt-5 text-[13.5px] leading-relaxed text-bosco">
        Controlla la posta: dentro c&apos;è il collegamento per entrare.
      </p>
    );
  }

  return (
    <form onSubmit={invia} className="mt-5 flex flex-col gap-2.5">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nome@esempio.it"
        className="rounded-[9px] border border-tratto bg-superficie px-3 py-2.5 text-[14px] outline-none focus:border-bosco"
      />
      <button
        type="submit"
        disabled={stato === "invio"}
        className="rounded-[10px] bg-bosco px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-bosco-scuro disabled:opacity-60"
      >
        {stato === "invio" ? "Invio in corso…" : "Mandami il collegamento"}
      </button>
      {stato === "errore" && <p className="text-[12.5px] text-vermiglio">{messaggio}</p>}
    </form>
  );
}
