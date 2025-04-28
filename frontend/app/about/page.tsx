import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">About StudentHunter</h1>
      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            StudentHunter is dedicated to bridging the gap between talented students and innovative companies. Our
            mission is to empower students to launch their careers with confidence and help employers find the next
            generation of exceptional talent.
          </p>
          <p>
            We believe in creating opportunities, fostering growth, and building a community where students and
            employers can connect, collaborate, and thrive together.
          </p>
        </CardContent>
      </Card>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>For Students</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access to exclusive job opportunities</li>
              <li>Personalized job matches based on your skills and interests</li>
              <li>Resources for career development and interview preparation</li>
              <li>Networking opportunities with top companies</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>For Employers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access to a pool of talented and motivated students</li>
              <li>Efficient hiring process with our advanced matching algorithm</li>
              <li>Branding opportunities to attract top student talent</li>
              <li>Tools to manage applications and schedule interviews</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
