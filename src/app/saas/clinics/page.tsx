import type { Metadata } from "next"
import SaasNavBar from "@/components/saas/SaasNavBar"
import SaasHeroSection from "@/components/saas/SaasHeroSection"
import AiFeatureGrid from "@/components/saas/AiFeatureGrid"
import ClinicCasesSection from "@/components/saas/ClinicCasesSection"
import TrustBar from "@/components/saas/TrustBar"
import SaasFaqSection from "@/components/saas/SaasFaqSection"
import SaasFinalCta from "@/components/saas/SaasFinalCta"
import SaasFooter from "@/components/saas/SaasFooter"

export const metadata: Metadata = {
  title: "AI-администратор для клиники — Optisphere",
  description:
    "Отвечает пациентам и ведёт запись 24/7. Запустить — 10 минут, без программиста.",
}

export default function ClinicsPage() {
  return (
    <>
      <SaasNavBar />
      <main>
        <SaasHeroSection />
        <AiFeatureGrid />
        <ClinicCasesSection />
        <TrustBar />
        <SaasFaqSection />
        <SaasFinalCta />
      </main>
      <SaasFooter />
    </>
  )
}
