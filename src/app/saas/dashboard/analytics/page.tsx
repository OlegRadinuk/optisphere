import type { Metadata } from "next"
import OwnerDashboard from "@/components/saas/OwnerDashboard"

export const metadata: Metadata = {
  title: "Аналитика — Optisphere AI-администратор",
}

export default function AnalyticsPage() {
  return <OwnerDashboard view="analytics" />
}
