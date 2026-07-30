import GuscioArea from "@/components/GuscioArea";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GuscioArea area="libreria">{children}</GuscioArea>;
}
