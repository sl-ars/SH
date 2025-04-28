"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings, Briefcase, Heart, ChevronRight, LayoutDashboard, Trophy } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationBell } from "@/components/notification-bell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Companies", href: "/companies" },
  { name: "Resources", href: "/resources" },
]

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, hasRole } = useAuth()

  // This is a placeholder. In a real app, you'd calculate this based on the user's profile completeness
  const profileCompletion = 70

  // Check if current path is a dashboard path
  const isDashboardPath = user && (
    pathname === `/${user.role}` || 
    pathname.startsWith(`/${user.role}/`)
  )

  // Handle scroll effect for iOS-style translucent header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get current page title for iOS-style centered title
  const getCurrentPageTitle = () => {
    const currentPath = pathname.split("/")[1]
    if (currentPath === "") return "Home"
    return currentPath.charAt(0).toUpperCase() + currentPath.slice(1)
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left side - Back button or menu on mobile */}
          <div className="flex items-center">
            <button
              className="md:hidden text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="hidden md:block text-lg font-semibold text-blue-500 dark:text-blue-400">
              SH
            </Link>
          </div>

          {/* Center - iOS style centered title */}

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-1">
            <ThemeToggle />

            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    // Don't mark Home as active if we're on a dashboard path
                    (pathname.startsWith(item.href) && item.href !== "/") || 
                    (item.href === "/" && pathname === "/" && !isDashboardPath)
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {user ? (
              <div className="flex items-center space-x-1">
                <NotificationBell />

                {user && user.role === "student" && (
                  <Link href="/career-quest" className="md:inline-flex hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Trophy className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                      <span>Quest</span>
                    </Button>
                  </Link>
                )}

                <Link href={user.role === "employer" ? "/employer" : `/${user.role}`} className="md:inline-flex hidden">
                  <Button
                    variant={isDashboardPath ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-full text-sm ${
                      isDashboardPath 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-xl" align="end">
                    <div className="flex items-center space-x-2 p-3 border-b dark:border-gray-700">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="p-1">
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href={`/profile`} className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span>My Profile</span>
                          <ChevronRight className="ml-auto h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </Link>
                      </DropdownMenuItem>
                      {user.role === "student" && (
                        <>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href="/student/saved-jobs" className="flex items-center cursor-pointer">
                              <Heart className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span>Saved Jobs</span>
                              <ChevronRight className="ml-auto h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href="/student/applications" className="flex items-center cursor-pointer">
                              <Briefcase className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span>My Applications</span>
                              <ChevronRight className="ml-auto h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/settings" className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span>Settings</span>
                          <ChevronRight className="ml-auto h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-500 dark:text-red-400 rounded-lg">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-white dark:bg-gray-900 h-full w-64 p-4 pt-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b dark:border-gray-800 pb-4">
              <Link
                href="/"
                className="text-xl font-bold text-blue-500 dark:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                StudentHunter
              </Link>
              <button
                className="text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col space-y-1 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    // Don't mark Home as active if we're on a dashboard path
                    (pathname === item.href && item.href !== "/") || 
                    (item.href === "/" && pathname === "/" && !isDashboardPath)
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {user && (
              <div className="space-y-2 border-t dark:border-gray-800 pt-4">
                <Link href="/career-quest" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Trophy className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                    Career Quest
                  </Button>
                </Link>
                <Link href={user.role === "employer" ? "/employer" : `/${user.role}`} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isDashboardPath ? "default" : "outline"}
                    className={`w-full justify-start ${
                      isDashboardPath 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" 
                        : "text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                    My Account
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-500 dark:text-red-400 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
            {!user && (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
