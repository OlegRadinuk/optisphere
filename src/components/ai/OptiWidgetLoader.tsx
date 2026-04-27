"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const OptiWidget = dynamic(() => import("./OptiWidget"), {
  ssr: false,
  loading: () => null,
})

export default function OptiWidgetLoader() {
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const hero = document.getElementById("hero")
    if (!hero) {
      setPastHero(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setPastHero(true)
      },
      { threshold: 0, rootMargin: "-80px" }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  if (!pastHero) return null
  return <OptiWidget />
}
