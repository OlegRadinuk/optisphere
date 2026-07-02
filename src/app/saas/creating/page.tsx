import type { Metadata } from "next"
import ProvisioningScreen from "@/components/saas/ProvisioningScreen"

export const metadata: Metadata = {
  title: "Создаём ассистента — Optisphere",
  description: "Настраиваем вашего AI-администратора.",
}

export default function CreatingPage() {
  return <ProvisioningScreen />
}
