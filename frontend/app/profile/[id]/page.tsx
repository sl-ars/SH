"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { userApi } from "@/lib/api"
import type { PublicProfile, PublicProfileEducation, PublicProfileExperience } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Briefcase, GraduationCap, MapPin, Star, UserCircle, ShieldCheck, Building, Award, School, Info } from 'lucide-react'

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        setLoading(true)
        try {
          const response = await userApi.getPublicUserProfile(userId)
          if (response.status === "success" && response.data) {
            setProfile(response.data)
          } else {
            toast.error(response.message || "Failed to fetch profile details.")
            setProfile(null)
          }
        } catch (error) {
          console.error("Error fetching profile details:", error)
          toast.error("An error occurred while fetching profile details.")
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }
      fetchProfile()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <p>Profile not found or failed to load.</p>
      </div>
    )
  }

  const displayName = profile.name?.trim() || "Unnamed User"
  const avatarFallbackChar = displayName.charAt(0).toUpperCase()

  const renderSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <div>
      <h3 className="text-xl font-semibold mb-3 flex items-center text-primary">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {content}
    </div>
  )

  const renderEducationCard = (edu: PublicProfileEducation, index: number) => (
    <Card key={index} className="mb-4 bg-slate-50 dark:bg-slate-800">
      <CardContent className="p-4">
        <CardTitle className="text-lg">{edu.university}</CardTitle>
        <CardDescription>{edu.degree} in {edu.field}</CardDescription>
        <p className="text-sm text-muted-foreground mt-1">
          {edu.start_date} - {edu.end_date}
        </p>
        {edu.gpa && <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>}
      </CardContent>
    </Card>
  );

  const renderExperienceCard = (exp: PublicProfileExperience, index: number) => (
    <Card key={index} className="mb-4 bg-slate-50 dark:bg-slate-800">
      <CardContent className="p-4">
        <CardTitle className="text-lg">{exp.position}</CardTitle>
        <CardDescription>{exp.company}</CardDescription>
        <p className="text-sm text-muted-foreground mt-1">
          {exp.start_date} - {exp.end_date}
        </p>
        {exp.description && <p className="text-sm mt-2 whitespace-pre-wrap">{exp.description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-2">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src={profile.avatar || undefined} alt={displayName} />
              <AvatarFallback className="text-3xl">{avatarFallbackChar}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl font-bold">{displayName}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground capitalize flex items-center justify-center sm:justify-start">
                {profile.role === 'student' && <GraduationCap className="mr-2 h-5 w-5" />}
                {profile.role === 'employer' && <Briefcase className="mr-2 h-5 w-5" />}
                {profile.role === 'admin' && <ShieldCheck className="mr-2 h-5 w-5" />}
                {profile.role === 'campus' && <School className="mr-2 h-5 w-5" />}
                {profile.role}
              </CardDescription>
              {profile.location && (
                <CardDescription className="text-md text-muted-foreground flex items-center mt-1 justify-center sm:justify-start">
                  <MapPin className="mr-2 h-5 w-5" /> {profile.location}
                </CardDescription>
              )}
              {profile.university && profile.role === 'student' && (
                 <CardDescription className="text-md text-muted-foreground flex items-center mt-1 justify-center sm:justify-start">
                  <School className="mr-2 h-5 w-5" /> {profile.university}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {profile.role === 'student' && profile.student_info && (
            <>
              {profile.student_info.bio && renderSection("About Me", <UserCircle className="h-6 w-6" />, 
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded-md">{profile.student_info.bio}</p>
              )}

              {profile.student_info.skills && profile.student_info.skills.length > 0 && renderSection("Skills", <Star className="h-6 w-6" />, 
                <div className="flex flex-wrap gap-2">
                  {profile.student_info.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              )}

              {profile.student_info.education && profile.student_info.education.length > 0 && renderSection("Education", <GraduationCap className="h-6 w-6" />, 
                <div>
                  {profile.student_info.education.map(renderEducationCard)}
                </div>
              )}

              {profile.student_info.experience && profile.student_info.experience.length > 0 && renderSection("Experience", <Briefcase className="h-6 w-6" />, 
                <div>
                  {profile.student_info.experience.map(renderExperienceCard)}
                </div>
              )}

              {profile.student_info.achievements && profile.student_info.achievements.length > 0 && renderSection("Achievements", <Award className="h-6 w-6" />, 
                <ul className="list-disc list-inside space-y-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  {profile.student_info.achievements.map((achievement, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{achievement}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* Placeholder for other roles if needed in the future, e.g., employer_info */}
          {profile.role === 'employer' && (
            renderSection("Employer Information", <Building className="h-6 w-6" />, 
              <p className="text-gray-700 dark:text-gray-300">Details for this employer profile are not yet displayed.</p>
            )
          )}

          {profile.role !== 'student' && profile.role !== 'employer' && (
             renderSection("Profile Information", <Info className="h-6 w-6" />, 
              <p className="text-gray-700 dark:text-gray-300">More details for this profile type will be available soon.</p>
            )
          )}

        </CardContent>
      </Card>
    </div>
  )
} 