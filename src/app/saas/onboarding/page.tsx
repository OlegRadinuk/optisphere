import type { Metadata } from "next"
import ArchitectBot from "@/components/saas/ArchitectBot"

export const metadata: Metadata = {
  title: "Настройка AI-ассистента — Optisphere",
  description: "Настройте AI-администратора для вашей клиники за 3–5 минут.",
}

export default function OnboardingPage() {
  return <ArchitectBot />
}
