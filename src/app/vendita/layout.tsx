import GuscioArea from "@/components/GuscioArea";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GuscioArea area="vendita">{children}</GuscioArea>;
}
