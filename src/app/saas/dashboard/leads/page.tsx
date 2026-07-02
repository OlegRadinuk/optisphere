import type { Metadata } from "next"
import OwnerDashboard from "@/components/saas/OwnerDashboard"

export const metadata: Metadata = {
  title: "Лиды — Optisphere AI-администратор",
}

export default function LeadsPage() {
  return <OwnerDashboard view="leads" />
}
