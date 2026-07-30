import Link from "next/link";
import Marchio from "@/components/Marchio";
import Sfondo from "@/components/Sfondo";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/config";
import ModuloAccesso from "./ModuloAccesso";

export default function Entra() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <Sfondo />
      <div className="tessera w-full max-w-[400px] rounded-[2px] px-6 py-8 text-center">
        <div className="mb-4 flex justify-center">
          <Marchio dimensione={28} />
        </div>
        <h1 className="text-[22px]">La Libreria di Annabella</h1>
        <p className="mt-2 text-[13.5px] text-inchiostro-2">
          {SUPABASE_CONFIGURATO
            ? "Inserisci la tua email: ti arriverà un collegamento per entrare."
            : "Il database non è ancora collegato."}
        </p>

        {SUPABASE_CONFIGURATO ? (
          <ModuloAccesso />
        ) : (
          <p className="mt-5 text-[13px] leading-relaxed text-inchiostro-3">
            Aggiungi le credenziali Supabase nel file <code>.env.local</code> e riavvia il server.
            Nel frattempo puoi girare per l&apos;applicazione liberamente.
          </p>
        )}

        <Link href="/" className="mt-6 inline-block text-[12.5px] text-inchiostro-3 hover:text-inchiostro-2">
          ← Torna all&apos;ingresso
        </Link>
      </div>
    </main>
  );
}
