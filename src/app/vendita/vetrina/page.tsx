import { redirect } from "next/navigation";

/** La vetrina vive fuori dal guscio privato: qui restava solo un vecchio collegamento. */
export default function Pagina() {
  redirect("/vetrina");
}
