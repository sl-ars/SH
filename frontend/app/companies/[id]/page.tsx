"use client"

import { useEffect, useState } from "react"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MapPin,
  Globe,
  Users,
  Calendar,
  Building,
  ExternalLink,
  Briefcase,
  Mail,
  Phone,
  Award,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { companyApi } from "@/lib/api/companies"
import { isMockEnabled } from "@/lib/utils/config"
import { mockCompanies } from "@/lib/mock-data" // Import mock data for fallback
import { useParams } from "next/navigation"

export default function CompanyDetailPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  
  // Use useParams hook to get the company ID
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true)
      try {
        // Check if mock data is enabled
        if (isMockEnabled()) {
          // Use mock data
          const mockCompany = mockCompanies[companyId]
          if (mockCompany) {
            setCompany(mockCompany)
          } else {
            setError("Company not found")
          }
        } else {
          // Use real API
          const response = await companyApi.getById(companyId)
          console.log("Company API response:", response)
          
          // Handle different response structures
          if (response && typeof response === 'object') {
            if ('data' in response && response.data) {
              const companyData = response.data as Company
              if (companyData.id && companyData.name && companyData.description && companyData.location && companyData.industry) {
                setCompany(companyData)
              } else {
                setError("Invalid company data")
              }
            } else if ('id' in response && 'name' in response && 'description' in response && 'location' in response && 'industry' in response) {
              // Direct company object
              setCompany(response as Company)
            } else {
              setError("Company not found")
            }
          } else {
            setError("Company not found")
          }
        }
      } catch (err) {
        console.error("Error fetching company:", err)
        setError(err instanceof Error ? err.message : "Failed to load company")
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [companyId])

  useEffect(() => {
    if (company && user) {
      // Check if the user has followed companies and if this company is in the list
      const userFollowedCompanies = (user as any).followedCompanies || []
      setIsFollowing(userFollowedCompanies.includes(company.id))
    }
  }, [company, user])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !company) {
    return <ErrorState message={error || "Company not found"} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="h-40 bg-gradient-to-r from-vibrant-blue to-vibrant-purple relative">
                <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10"></div>
              </div>
              <CardHeader className="-mt-20 relative z-10">
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-lg">
                  <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white p-2 shadow-md">
                      <Image
                        src={company.logo || "/placeholder.svg"}
                        alt={company.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
                        {company.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-4 text-muted-foreground">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-vibrant-blue" />
                          {company.industry}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-vibrant-green" />
                          {company.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-vibrant-orange" />
                          {company.size} employees
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-vibrant-pink" />
                          Founded {company.founded}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-vibrant-blue/5 to-vibrant-purple/5 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-blue">About</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{company.description}</p>
                </div>

                <div className="bg-gradient-to-r from-vibrant-green/5 to-vibrant-blue/5 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold mb-3 text-vibrant-green">Company Culture</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{company.culture}</p>
                </div>

                {company.benefits && company.benefits.length > 0 && (
                  <div className="bg-gradient-to-r from-vibrant-orange/5 to-vibrant-pink/5 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-3 text-vibrant-orange">Benefits</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {company.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                          <CheckCircle className="w-5 h-5 mr-3 text-vibrant-green" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {company.jobs && company.jobs.length > 0 && (
                  <div className="bg-gradient-to-r from-vibrant-purple/5 to-vibrant-blue/5 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-3 text-vibrant-purple">Open Positions</h2>
                    <div className="space-y-4">
                      {company.jobs.map((job) => (
                        <Link key={job.id} href={`/jobs/${job.id}`}>
                          <Card className="hover:shadow-md transition-all duration-300 border-none">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold mb-1 group-hover:text-vibrant-blue">{job.title}</h3>
                                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {job.location}
                                    </span>
                                    <span className="flex items-center">
                                      <Briefcase className="w-3 h-3 mr-1" />
                                      {job.type}
                                    </span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-vibrant-blue/10">
                                  <ExternalLink className="w-4 h-4 text-vibrant-blue" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
              <CardContent className="pt-6">
                {user?.role === "student" && (
                  <Button
                    className="w-full mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
                    size="lg"
                    onClick={() => {
                      if (isFollowing) {
                        // unfollowCompany(company.id)
                        setIsFollowing(false)
                      } else {
                        // followCompany(company.id)
                        setIsFollowing(true)
                      }
                    }}
                  >
                    {isFollowing ? "Unfollow Company" : "Follow Company"}
                  </Button>
                )}
                {user?.role === "manager" && company.id === user.company && (
                  <Button
                    className="w-full mb-4 bg-gradient-to-r from-vibrant-green to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-green transition-all duration-300"
                    size="lg"
                  >
                    Edit Company Profile
                  </Button>
                )}
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="w-full hover:bg-vibrant-blue/10 hover:text-vibrant-blue transition-colors duration-300"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
              <CardHeader>
                <CardTitle className="text-vibrant-green">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-vibrant-blue" />
                  <span>careers@{company.name.toLowerCase().replace(/\s+/g, "")}.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-vibrant-blue" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-vibrant-blue" />
                  <span>{company.location}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
              <CardHeader>
                <CardTitle className="text-vibrant-orange">Company Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-vibrant-blue/5 to-vibrant-purple/5">
                  <Award className="w-5 h-5 mr-3 text-vibrant-purple" />
                  <span>Top Employer 2024</span>
                </div>
                <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-vibrant-green/5 to-vibrant-blue/5">
                  <CheckCircle className="w-5 h-5 mr-3 text-vibrant-green" />
                  <span>Verified Company</span>
                </div>
                <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-vibrant-orange/5 to-vibrant-pink/5">
                  <Users className="w-5 h-5 mr-3 text-vibrant-orange" />
                  <span>Active Recruiter</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
              <CardHeader>
                <CardTitle className="text-vibrant-purple">Similar Companies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Link href={`/companies/${i}`} key={i}>
                    <div className="flex items-center p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mr-3">
                        <Building className="w-5 h-5 text-vibrant-blue" />
                      </div>
                      <div>
                        <p className="font-medium">Similar Company {i}</p>
                        <p className="text-sm text-muted-foreground">Industry • Location</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-xl" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-11 w-full mb-4" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="border-none shadow-lg">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{message}</p>
          <Link href="/companies">
            <Button className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
              Back to Companies
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
