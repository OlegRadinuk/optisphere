import { EstetShell } from "@/components/estet/EstetShell"

export default function EstetLayout({ children }: { children: React.ReactNode }) {
  return <EstetShell>{children}</EstetShell>
}
