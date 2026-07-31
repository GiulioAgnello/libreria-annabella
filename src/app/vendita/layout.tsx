import { redirect } from "next/navigation";
import GuscioArea from "@/components/GuscioArea";
import { utenteCorrente } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/config";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (SUPABASE_CONFIGURATO) {
    const utente = await utenteCorrente();
    if (!utente) redirect("/");
  }

  return <GuscioArea area="vendita">{children}</GuscioArea>;
}
