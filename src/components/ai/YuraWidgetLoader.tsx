"use client"

import dynamic from "next/dynamic"

const YuraWidget = dynamic(() => import("./YuraWidget"), {
  ssr: false,
  loading: () => null,
})

export default function YuraWidgetLoader() {
  return <YuraWidget />
}
