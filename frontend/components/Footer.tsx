import Link from "next/link"
import { Home, BookOpen, Briefcase, Users, Heart, Mail, Phone, MapPin, ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">StudentHunter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Connecting students with opportunities and resources to build successful careers.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
              <Link
                href="#"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-blue-500 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-blue-500 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-blue-500 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-muted-foreground hover:text-blue-500 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Companies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                <a href="mailto:info@studenthunter.kz" className="hover:text-blue-500">
                  info@studenthunter.kz
                </a>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-2 text-blue-500" />
                <a href="tel:+77777777777" className="hover:text-blue-500">
                  +7 777 777 7777
                </a>
              </li>
              <li className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                <span>KBTU, Almaty, Kazakhstan</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-blue-500 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-blue-500 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-blue-500 flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* iOS-style bottom bar */}
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; 2025 StudentHunter. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-blue-500">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-blue-500">
                Terms
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-blue-500">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
