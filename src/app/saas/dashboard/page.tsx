import type { Metadata } from "next"
import OwnerDashboard from "@/components/saas/OwnerDashboard"

export const metadata: Metadata = {
  title: "Кабинет — Optisphere AI-администратор",
}

export default function DashboardPage() {
  return <OwnerDashboard view="overview" />
}
