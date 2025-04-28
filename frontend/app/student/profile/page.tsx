"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  FileText,
  Download,
  Calendar,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { Progress } from "@/components/ui/progress"
import { userApi } from "@/lib/api/user"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { UserProfile, Experience, Education, Achievement } from "@/lib/types"
import {USER_ROLES} from "@/lib/constants/roles";
import { AvatarUpload } from "@/components/avatar-upload"
import { ResumeList } from "@/components/resume-list"

export default function StudentProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [initialProfileData, setInitialProfileData] = useState<UserProfile | null>(null)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null)
  const [expandedEducation, setExpandedEducation] = useState<number | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [skillsInputValue, setSkillsInputValue] = useState<string>("")
  const [achievementsInputValue, setAchievementsInputValue] = useState<string>("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await userApi.getMyProfile()

        const profileDataFromApi = response.data
        setProfileData(profileDataFromApi)
        setInitialProfileData(profileDataFromApi)
        if (profileDataFromApi) {
          setSkillsInputValue(profileDataFromApi.skills?.join(", ") || "")
          setAchievementsInputValue(profileDataFromApi.achievements?.join("\n") || "")
        }

        // Calculate profile completion and identify missing fields
        const requiredFields = [
          { name: "name", label: "Full Name" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone Number" },
          { name: "location", label: "Location" },
          { name: "bio", label: "Bio" },
          { name: "education", label: "Education" },
          { name: "skills", label: "Skills" },
          { name: "experience", label: "Work Experience" },
          { name: "achievements", label: "Achievements" },
        ]

        const missing: string[] = []
        let completedCount = 0

        requiredFields.forEach((field) => {
          if (field.name === "education") {
            if (profileDataFromApi?.education && profileDataFromApi?.education.length > 0 && profileDataFromApi?.education[0]?.university) {
              completedCount++
            } else {
              missing.push(field.label)
            }
          } else if (field.name === "skills") {
            if (profileDataFromApi?.skills && profileDataFromApi.skills.length > 0) {
              completedCount++
            } else {
              missing.push(field.label)
            }
          } else if (field.name === "experience") {
            if (profileDataFromApi?.experience && profileDataFromApi.experience.length > 0 && profileDataFromApi.experience[0]?.company) {
              completedCount++
            } else {
              missing.push(field.label)
            }
          } else if (field.name === "achievements") {
            if (profileDataFromApi?.achievements && profileDataFromApi.achievements.length > 0) {
              completedCount++
            } else {
              missing.push(field.label)
            }
          } else {
            if (profileDataFromApi?.[field.name as keyof UserProfile]) {
              completedCount++
            } else {
              missing.push(field.label)
            }
          }
        })

        setMissingFields(missing)
        setProfileCompletion((completedCount / requiredFields.length) * 100)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, router, isLoading])

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfileData((prev) => {
      if (!prev) return null;
      const newProfileData = { ...prev, [field]: value };
      return newProfileData;
    });
  };

  const handleProfileUpdate = async () => {
    if (!profileData || !initialProfileData) return;

    console.log("[handleProfileUpdate] Current profileData.avatar:", profileData.avatar); // DEBUG
    console.log("[handleProfileUpdate] Initial initialProfileData.avatar:", initialProfileData.avatar); // DEBUG
    if ((profileData.avatar as any) instanceof File) {
      console.log("[handleProfileUpdate] profileData.avatar is a File object.");
    }

    try {
      setSaving(true)

      const changedData: Partial<UserProfile> = {}
      for (const key in profileData) {
        if (Object.prototype.hasOwnProperty.call(profileData, key)) {
          const typedKey = key as keyof UserProfile
          const valueFromProfile = profileData[typedKey];
          const valueFromInitial = initialProfileData ? initialProfileData[typedKey] : undefined;

          if (JSON.stringify(valueFromProfile) !== JSON.stringify(valueFromInitial)) {
            changedData[typedKey] = valueFromProfile;
          }
        }
      }
      
      if (Object.keys(changedData).length === 0) {
        toast.info("No Changes", {
          description: "You haven\'t made any changes to your profile.",
        })
        setSaving(false)
        return
      }

      await userApi.updateProfile(changedData as UserProfile)
      setInitialProfileData(profileData) 
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const addExperience = () => {
    if (!profileData) return
    const newExperience = {
      id: `exp-${Date.now()}`,
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      current: false,
    }

    const updatedExperience = [...(profileData.experience || []), newExperience]
    handleInputChange("experience", updatedExperience)

    // Expand the newly added experience
    setExpandedExperience(updatedExperience.length - 1)
  }

  const updateExperience = (index: number, field: string, value: any) => {
    if (!profileData?.experience) return

    const updatedExperience = [...profileData.experience]
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value,
    }

    handleInputChange("experience", updatedExperience)
  }

  const removeExperience = (index: number) => {
    if (!profileData?.experience) return

    const updatedExperience = [...profileData.experience]
    updatedExperience.splice(index, 1)

    handleInputChange("experience", updatedExperience)
    setExpandedExperience(null)
  }

  const addEducation = () => {
    if (!profileData) return
    const newEducation = {
      id: `edu-${Date.now()}`,
      university: "",
      field: "",
      degree: "",
      start_date: "",
      end_date: "",
      gpa: "",
      description: "",
    }

    const updatedEducation = [...(profileData.education || []), newEducation]
    handleInputChange("education", updatedEducation)

    // Expand the newly added education
    setExpandedEducation(updatedEducation.length - 1)
  }

  const updateEducation = (index: number, field: string, value: any) => {
    if (!profileData?.education) return

    const updatedEducation = [...profileData.education]
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    }

    handleInputChange("education", updatedEducation)
  }

  const removeEducation = (index: number) => {
    if (!profileData?.education) return

    const updatedEducation = [...profileData.education]
    updatedEducation.splice(index, 1)

    handleInputChange("education", updatedEducation)
    setExpandedEducation(null)
  }

  const moveExperienceUp = (index: number) => {
    if (!profileData?.experience || index === 0) return

    const updatedExperience = [...profileData.experience]
    const temp = updatedExperience[index]
    updatedExperience[index] = updatedExperience[index - 1]
    updatedExperience[index - 1] = temp

    handleInputChange("experience", updatedExperience)
    setExpandedExperience(index - 1)
  }

  const moveExperienceDown = (index: number) => {
    if (!profileData?.experience || index === profileData.experience.length - 1) return

    const updatedExperience = [...profileData.experience]
    const temp = updatedExperience[index]
    updatedExperience[index] = updatedExperience[index + 1]
    updatedExperience[index + 1] = temp

    handleInputChange("experience", updatedExperience)
    setExpandedExperience(index + 1)
  }

  if (!user) return null

  return (
    <ProtectedRoute roles={[USER_ROLES.STUDENT]}>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Your Profile
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Overview */}
              <div className="md:col-span-1 space-y-6">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple"></div>
                  <CardContent className="-mt-16 relative">
                    <AvatarUpload
                      currentAvatar={profileData?.avatar}
                      onAvatarChange={(newAvatarUrl) => {
                        console.log("[StudentProfilePage] AvatarUpload returned new URL:", newAvatarUrl);
                        setProfileData(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
                        setInitialProfileData(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
                      }}
                      role={user?.role}
                    />
                    <h2 className="mt-4 text-2xl font-bold text-center">{profileData?.name}</h2>
                    <p className="text-muted-foreground text-center">Student</p>
                  </CardContent>
                </Card>

                {/* Skills Visualization */}
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center text-vibrant-orange">
                      <Star className="w-5 h-5 mr-2" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData?.skills?.map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-vibrant-orange/20 to-vibrant-pink/20 text-vibrant-orange border-none hover:from-vibrant-orange/30 hover:to-vibrant-pink/30"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(!profileData?.skills || profileData.skills.length === 0) && (
                        <p className="text-sm text-muted-foreground">Add your skills to help employers find you</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Resumes */}
                {/* 
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-green w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center text-vibrant-blue">
                      <FileText className="w-5 h-5 mr-2" />
                      Resumes
                    </CardTitle>
                    <CardDescription>Upload and manage your resumes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ResumeUpload onUploadComplete={handleResumeUploadComplete} />

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Your Resumes</h4>
                      {loadingResumes ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vibrant-blue"></div>
                        </div>
                      ) : resumes.length > 0 ? (
                        <div className="space-y-2">
                          {resumes.map((resume) => (
                            <div key={resume.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-vibrant-blue" />
                                <div>
                                  <p className="text-sm font-medium">{resume.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(resume.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={resume.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-4 h-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteResume(resume.id)}
                                  disabled={deletingResume === resume.id}
                                >
                                  {deletingResume === resume.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          No resumes uploaded yet. Upload your resume to apply for jobs more quickly.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                */}
              </div>

              {/* Main Profile Content */}
              <div className="md:col-span-2 space-y-6">
                <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <Card className="border-none shadow-lg overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
                      <CardHeader>
                        <CardTitle className="flex items-center text-vibrant-blue">
                          <User className="w-5 h-5 mr-2" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={profileData?.name || ""}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData?.email || ""}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              disabled={true}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={profileData?.phone || ""}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              placeholder="+1 (555) 555-5555"
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="City, State"
                              value={profileData?.location || ""}
                              onChange={(e) => handleInputChange("location", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            placeholder="Tell us about yourself"
                            value={profileData?.bio || ""}
                            onChange={(e) => handleInputChange("bio", e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="skills">Skills</Label>
                          <Textarea
                            id="skills"
                            placeholder="Enter your skills (separated by commas)"
                            value={skillsInputValue}
                            onChange={(e) => {
                              const newRawValue = e.target.value;
                              setSkillsInputValue(newRawValue);

                              const skillsArray = newRawValue
                                .split(",")
                                .map((skill) => skill.trim())
                                .filter(Boolean);
                              handleInputChange("skills", skillsArray);
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card className="border-none shadow-lg overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-vibrant-yellow to-vibrant-orange w-full"></div>
                      <CardHeader>
                        <CardTitle className="flex items-center text-vibrant-yellow">
                          <Award className="w-5 h-5 mr-2" />
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <Label htmlFor="achievements">Achievements</Label>
                          <Textarea
                            id="achievements"
                            placeholder="List your key achievements and awards (one per line)"
                            value={achievementsInputValue}
                            onChange={(e) => {
                              setAchievementsInputValue(e.target.value);
                              const newAchievements = e.target.value
                                .split("\n")
                                .map(s => s.trim())
                                .filter(s => s);
                              setProfileData(prev => (prev ? { ...prev, achievements: newAchievements } : null));
                            }}
                            className="min-h-[120px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Education Tab */}
                  <TabsContent value="education" className="space-y-6">
                    <Card className="border-none shadow-lg overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center text-vibrant-green">
                          <GraduationCap className="w-5 h-5 mr-2" />
                          Education
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-vibrant-green hover:text-white hover:bg-vibrant-green"
                          onClick={addEducation}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Education
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profileData?.education && profileData.education.length > 0 ? (
                          <div className="space-y-4">
                            {profileData.education.map((edu, index) => (
                              <Card key={edu.id || index} className="border border-muted">
                                <CardHeader className="p-4 flex flex-row items-center justify-between">
                                  <div>
                                    <CardTitle className="text-base">{edu.university || "Add University"}</CardTitle>
                                    <CardDescription>
                                      {edu.field ? `${edu.degree || "Degree"} in ${edu.field}` : "Add Degree and Field"}
                                    </CardDescription>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExpandedEducation(expandedEducation === index ? null : index)}
                                    >
                                      {expandedEducation === index ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </CardHeader>

                                {expandedEducation === index && (
                                  <CardContent className="p-4 pt-0">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label htmlFor={`university-${index}`}>University</Label>
                                        <Input
                                          id={`university-${index}`}
                                          placeholder="Enter your university"
                                          value={edu.university || ""}
                                          onChange={(e) => updateEducation(index, "university", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`degree-${index}`}>Degree</Label>
                                        <Input
                                          id={`degree-${index}`}
                                          placeholder="Bachelor's, Master's, etc."
                                          value={edu.degree || ""}
                                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`field-${index}`}>Field of Study</Label>
                                        <Input
                                          id={`field-${index}`}
                                          placeholder="Enter your major"
                                          value={edu.field || ""}
                                          onChange={(e) => updateEducation(index, "field", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`gpa-${index}`}>GPA</Label>
                                        <Input
                                          id={`gpa-${index}`}
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          max="4"
                                          value={edu.gpa || ""}
                                          onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                                        <Input
                                          id={`start-date-${index}`}
                                          type="month"
                                          value={edu.start_date || ""}
                                          onChange={(e) => updateEducation(index, "start_date", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`end-date-${index}`}>End Date (or Expected)</Label>
                                        <Input
                                          id={`end-date-${index}`}
                                          type="month"
                                          value={edu.end_date || ""}
                                          onChange={(e) => updateEducation(index, "end_date", e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <Label htmlFor={`description-${index}`}>Description</Label>
                                      <Textarea
                                        id={`description-${index}`}
                                        placeholder="Describe your studies, achievements, etc."
                                        value={edu.description || ""}
                                        onChange={(e) => updateEducation(index, "description", e.target.value)}
                                      />
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                      <Button variant="destructive" size="sm" onClick={() => removeEducation(index)}>
                                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                                      </Button>
                                    </div>
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Education Added</h3>
                            <p className="text-muted-foreground mb-4">
                              Add your educational background to help employers understand your qualifications.
                            </p>
                            <Button variant="outline" onClick={addEducation}>
                              <Plus className="w-4 h-4 mr-1" /> Add Education
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Experience Tab */}
                  <TabsContent value="experience" className="space-y-6">
                    <Card className="border-none shadow-lg overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center text-vibrant-purple">
                          <Briefcase className="w-5 h-5 mr-2" />
                          Work Experience
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-vibrant-purple hover:text-white hover:bg-vibrant-purple"
                          onClick={addExperience}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Experience
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profileData?.experience && profileData.experience.length > 0 ? (
                          <div className="space-y-4">
                            {profileData.experience.map((exp, index) => (
                              <Card key={exp.id || index} className="border border-muted">
                                <CardHeader className="p-4 flex flex-row items-center justify-between">
                                  <div>
                                    <CardTitle className="text-base">
                                      {exp.position || "Add Position"} {exp.company ? `at ${exp.company}` : ""}
                                    </CardTitle>
                                    <CardDescription className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {exp.start_date ? (
                                        <>
                                          {new Date(exp.start_date).toLocaleDateString("en-US", {
                                            month: "short",
                                            year: "numeric",
                                          })}
                                          {" - "}
                                          {exp.current
                                            ? "Present"
                                            : exp.end_date
                                              ? new Date(exp.end_date).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  year: "numeric",
                                                })
                                              : "Present"}
                                        </>
                                      ) : (
                                        "Add dates"
                                      )}
                                    </CardDescription>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveExperienceUp(index)}
                                      disabled={index === 0}
                                      className={index === 0 ? "opacity-50" : ""}
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveExperienceDown(index)}
                                      disabled={index === (profileData.experience?.length || 0) - 1}
                                      className={
                                        index === (profileData.experience?.length || 0) - 1 ? "opacity-50" : ""
                                      }
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExpandedExperience(expandedExperience === index ? null : index)}
                                    >
                                      {expandedExperience === index ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </CardHeader>

                                {expandedExperience === index && (
                                  <CardContent className="p-4 pt-0">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label htmlFor={`company-${index}`}>Company</Label>
                                        <Input
                                          id={`company-${index}`}
                                          placeholder="Enter company name"
                                          value={exp.company || ""}
                                          onChange={(e) => updateExperience(index, "company", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`position-${index}`}>Position</Label>
                                        <Input
                                          id={`position-${index}`}
                                          placeholder="Enter your position"
                                          value={exp.position || ""}
                                          onChange={(e) => updateExperience(index, "position", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`start-date-${index}`}>Start Date</Label>
                                        <Input
                                          id={`start-date-${index}`}
                                          type="month"
                                          value={exp.start_date || ""}
                                          onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <Label htmlFor={`end-date-${index}`}>End Date</Label>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            id={`end-date-${index}`}
                                            type="month"
                                            value={exp.end_date || ""}
                                            onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                                            disabled={exp.current}
                                            className={exp.current ? "opacity-50" : ""}
                                          />
                                          <div className="flex items-center space-x-1">
                                            <input
                                              type="checkbox"
                                              id={`current-${index}`}
                                              checked={exp.current || false}
                                              onChange={(e) => updateExperience(index, "current", e.target.checked)}
                                              className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={`current-${index}`} className="text-xs">
                                              Current
                                            </Label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <Label htmlFor={`job-description-${index}`}>Job Description</Label>
                                      <Textarea
                                        id={`job-description-${index}`}
                                        placeholder="Describe your responsibilities and achievements"
                                        value={exp.description || ""}
                                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                                        className="min-h-[120px]"
                                      />
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                      <Button variant="destructive" size="sm" onClick={() => removeExperience(index)}>
                                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                                      </Button>
                                    </div>
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Work Experience Added</h3>
                            <p className="text-muted-foreground mb-4">
                              Add your work experience to showcase your professional background to potential employers.
                            </p>
                            <Button variant="outline" onClick={addExperience}>
                              <Plus className="w-4 h-4 mr-1" /> Add Experience
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
                    onClick={handleProfileUpdate}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
