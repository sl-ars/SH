import type React from "react"
import CampusRoute from "@/components/campus-route"

export default function CampusLayout({ children }: { children: React.ReactNode }) {
  return <CampusRoute>{children}</CampusRoute>
}
