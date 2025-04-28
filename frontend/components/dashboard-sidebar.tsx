"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BarChart, Briefcase, Building, Calendar, FileText, GraduationCap, Home, Settings, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { NotificationProvider } from "@/contexts/notification-context"

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Define navigation items based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case "student":
        return [
          { title: "Dashboard", icon: Home, href: "/student" },
          { title: "Saved Jobs", icon: Briefcase, href: "/student/saved-jobs" },
          { title: "Applications", icon: FileText, href: "/student/applications" },
          { title: "Interviews", icon: Calendar, href: "/student/interviews" },
          { title: "Profile", icon: Users, href: "/student/profile" },
        ]
      case "campus":
        return [
          { title: "Dashboard", icon: Home, href: "/campus" },
          { title: "Analytics", icon: BarChart, href: "/campus/analytics" },
          { title: "Events", icon: Calendar, href: "/campus/events" },
          { title: "Companies", icon: Building, href: "/campus/companies" },
          { title: "Students", icon: GraduationCap, href: "/campus/students" },
          { title: "Reports", icon: FileText, href: "/campus/reports" },
          { title: "Settings", icon: Settings, href: "/campus/settings" },
        ]
      case "employer":
        return [
          { title: "Dashboard", icon: Home, href: "/employer" },
          { title: "Post Job", icon: Briefcase, href: "/employer/jobs/new" },
          { title: "Applications", icon: FileText, href: "/employer/applications" },
          { title: "Company", icon: Building, href: "/employer/company" },
          { title: "Analytics", icon: BarChart, href: "/employer/analytics" },
          { title: "Interviews", icon: Calendar, href: "/employer/interviews" },
          { title: "Settings", icon: Settings, href: "/employer/settings" },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex h-[60px] items-center px-6">
              <span className="font-semibold">StudentHunter</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          <div className="flex h-[60px] items-center border-b px-6">
            <SidebarTrigger />
          </div>
          <NotificationProvider>{children}</NotificationProvider>
        </main>
      </div>
    </SidebarProvider>
  )
}
