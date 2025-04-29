import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
        Privacy Policy
      </h1>
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
        <CardHeader>
          <CardTitle className="text-2xl text-vibrant-blue">Your Privacy Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            At StudentHunter, we are committed to protecting your privacy and ensuring the security of your personal
            information. This Privacy Policy outlines how we collect, use, and safeguard your data.
          </p>
          <h2 className="text-xl font-semibold text-vibrant-purple">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Personal information (name, email, phone number)</li>
            <li>Educational background</li>
            <li>Work experience and skills</li>
            <li>Job preferences and application history</li>
          </ul>
          <h2 className="text-xl font-semibold text-vibrant-green">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To match you with relevant job opportunities</li>
            <li>To improve our services and user experience</li>
            <li>To communicate important updates and notifications</li>
          </ul>
          <p>
            For more detailed information about our privacy practices, please contact our privacy team at
            privacy@studenthunter.com.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
