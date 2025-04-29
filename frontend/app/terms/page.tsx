import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-orange to-vibrant-pink bg-clip-text text-transparent">
        Terms of Service
      </h1>
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
        <CardHeader>
          <CardTitle className="text-2xl text-vibrant-orange">Welcome to StudentHunter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            By using StudentHunter, you agree to comply with and be bound by the following terms and conditions of use.
            Please read these terms carefully before using our platform.
          </p>
          <h2 className="text-xl font-semibold text-vibrant-pink">1. Acceptance of Terms</h2>
          <p>
            By accessing or using StudentHunter, you agree to be bound by these Terms of Service and all applicable laws
            and regulations.
          </p>
          <h2 className="text-xl font-semibold text-vibrant-yellow">2. User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide accurate and up-to-date information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Use the platform in a manner consistent with all applicable laws and regulations</li>
          </ul>
          <h2 className="text-xl font-semibold text-vibrant-green">3. Intellectual Property</h2>
          <p>
            All content on StudentHunter, including text, graphics, logos, and software, is the property of
            StudentHunter and protected by copyright and other intellectual property laws.
          </p>
          <p className="text-sm text-muted-foreground mt-8">
            For the complete Terms of Service, please contact our legal team at legal@studenthunter.com.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
