import { redirect } from "next/navigation";

/** Il modulo di accesso ora vive direttamente sull'ingresso: qui restava solo un vecchio collegamento. */
export default function Entra() {
  redirect("/");
}
