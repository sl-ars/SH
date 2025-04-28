import Link from "next/link"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Cookies Policy | StudentHunter",
  description: "Learn about how StudentHunter uses cookies and how you can manage your cookie preferences.",
}

export default function CookiesPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Cookies Policy</h1>
        <p className="text-muted-foreground">Last updated: April 10, 2025</p>
      </div>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About Cookies</TabsTrigger>
          <TabsTrigger value="types">Types of Cookies</TabsTrigger>
          <TabsTrigger value="manage">Managing Cookies</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>What Are Cookies?</CardTitle>
              <CardDescription>Understanding how cookies work on StudentHunter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us
                provide you with a better experience by enabling features like remembering your preferences, keeping you
                logged in, and understanding how you use our platform.
              </p>
              <p>
                At StudentHunter, we use cookies to enhance your job search experience, connect students with employers
                more effectively, and improve our platform based on how it's being used.
              </p>
              <p>
                This Cookies Policy explains what cookies are, how we use them, the types of cookies we use, and how you
                can control your cookie preferences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Cookies</CardTitle>
              <CardDescription>The ways StudentHunter utilizes cookies to improve your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use cookies for several purposes, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Authentication and Security:</strong> To keep you logged in and protect your account from
                  unauthorized access.
                </li>
                <li>
                  <strong>Preferences:</strong> To remember your settings and preferences, such as language, display
                  preferences, and notification settings.
                </li>
                <li>
                  <strong>Analytics:</strong> To understand how users interact with our platform, which helps us improve
                  features and user experience.
                </li>
                <li>
                  <strong>Personalization:</strong> To customize content and job recommendations based on your interests
                  and activity.
                </li>
                <li>
                  <strong>Performance:</strong> To optimize the performance of our website and ensure it loads quickly
                  and efficiently.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
              <CardDescription>Different categories of cookies on StudentHunter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Badge className="mt-1" variant="outline">
                    Essential
                  </Badge>
                  <div>
                    <h3 className="font-medium">Essential Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      These cookies are necessary for the website to function properly. They enable core functionality
                      such as security, network management, and account access. You cannot opt out of these cookies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Badge className="mt-1" variant="outline">
                    Functional
                  </Badge>
                  <div>
                    <h3 className="font-medium">Functional Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      These cookies enable us to provide enhanced functionality and personalization. They may be set by
                      us or by third-party providers whose services we have added to our pages. If you disable these
                      cookies, some or all of these services may not function properly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Badge className="mt-1" variant="outline">
                    Analytics
                  </Badge>
                  <div>
                    <h3 className="font-medium">Analytics Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      These cookies help us understand how visitors interact with our website by collecting and
                      reporting information anonymously. They help us improve our website and services based on user
                      behavior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Badge className="mt-1" variant="outline">
                    Marketing
                  </Badge>
                  <div>
                    <h3 className="font-medium">Marketing Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      These cookies are used to track visitors across websites. They are set to display targeted
                      advertisements that are relevant and engaging for individual users, and thereby more valuable for
                      publishers and third-party advertisers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Badge className="mt-1" variant="outline">
                    Third-party
                  </Badge>
                  <div>
                    <h3 className="font-medium">Third-Party Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Some features on our website use cookies from third-party services such as Google Analytics,
                      social media platforms, and payment processors. These cookies are subject to the respective
                      privacy policies of these external services.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Managing Your Cookie Preferences</CardTitle>
              <CardDescription>How to control which cookies are used when you visit StudentHunter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You can manage your cookie preferences in several ways:</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Cookie Preference Center</h3>
                  <p className="text-sm text-muted-foreground">
                    You can adjust your cookie preferences at any time using our Cookie Preference Center. This allows
                    you to select which categories of cookies you accept or reject.
                  </p>
                  <Button variant="outline" className="mt-2">
                    Open Cookie Preferences
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Browser Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse
                    cookies, delete cookies, or alert you when cookies are being sent. The methods for doing so vary
                    from browser to browser, and from version to version.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can generally find these settings in the "options" or "preferences" menu of your browser. You
                    may also consult the browser's "help" menu for more information.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Third-Party Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    You can also manage cookies through various third-party tools such as:
                  </p>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground">
                    <li>Your Online Choices (EU)</li>
                    <li>Network Advertising Initiative (US)</li>
                    <li>Digital Advertising Alliance (US)</li>
                    <li>DAAC (Canada)</li>
                    <li>DDAI (Japan)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Important Note</h3>
                  <p className="text-sm text-muted-foreground">
                    Please be aware that restricting cookies may impact the functionality of our website. Many of our
                    services will not function properly if your browser is configured to disable cookies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Us About Cookies</CardTitle>
              <CardDescription>How to reach us with questions about our cookies policy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>If you have any questions about our use of cookies or this Cookies Policy, please contact us:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm">privacy@studenthunter.kz</p>
                </div>

                <div>
                  <h3 className="font-medium">Postal Address</h3>
                  <p className="text-sm">
                    StudentHunter Privacy Team
                    <br />
                    KBTU
                    <br />
                    Almaty
                    <br />
                    Kazakhstan
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Data Protection Officer</h3>
                  <p className="text-sm">
                    You can contact our Data Protection Officer directly at dpo@studenthunter.kz
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  For more information about how we protect your privacy, please review our{" "}
                  <Link href="/privacy" className="text-primary underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  For information about our terms of service, please review our{" "}
                  <Link href="/terms" className="text-primary underline underline-offset-4">
                    Terms of Service
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
