import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import { howItWorksSteps, keyFeatures, careerResources, featuredJobs, successStories } from "@/lib/mock-data/homepage"
import { HomePageCarousel } from "@/components/home-page-carousel"
import { HomePageCharts } from "@/components/home-page-charts"
import { PlatformStatsComponent } from "@/components/platform-stats"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Auto-Sliding Carousel */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"></div>
        <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <HomePageCarousel />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background"></div>
      </section>

      {/* How It Works Section - iOS Style */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              How StudentHunter Works
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform simplifies the job search process for students and recruitment for employers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksSteps.map((step, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-${step.color}-500`}></div>
                <div className="absolute top-4 right-4 text-3xl font-bold opacity-10 group-hover:opacity-20 transition-opacity text-gray-400 dark:text-gray-600">
                  {step.step}
                </div>
                <CardHeader className="pb-2">
                  <div
                    className={`w-12 h-12 rounded-full bg-${step.color}-100 dark:bg-${step.color}-900/30 text-${step.color}-500 dark:text-${step.color}-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {React.createElement(step.icon, { className: "w-6 h-6" })}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Carousel */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Featured Opportunities
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover top job opportunities from leading companies
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex gap-6 py-4 animate-carousel">
                {[...featuredJobs, ...featuredJobs].map((job, index) => (
                  <Card
                    key={index}
                    className="min-w-[300px] max-w-[300px] rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Image src={job.companyLogo || "/placeholder.svg"} alt={job.company} width={24} height={24} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{job.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                          {job.type}
                        </span>
                        <span className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                          {job.location}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/jobs/${job.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section with Charts */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"></div>
        <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Platform Statistics</h2>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
              Join thousands of students and employers already using StudentHunter
            </p>
          </div>
          <PlatformStatsComponent />
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Impact in Numbers</h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how StudentHunter is transforming student careers
            </p>
          </div>

          <HomePageCharts />
        </div>
      </section>

      {/* Key Features Section - iOS Style */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose StudentHunter?
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform offers unique features designed specifically for students and recent graduates
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => (
              <Card
                key={index}
                className="text-center group hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
              >
                <CardHeader>
                  <div
                    className={`w-14 h-14 mx-auto rounded-full bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    {React.createElement(feature.icon, {
                      className: `w-7 h-7 text-${feature.color}-500 dark:text-${feature.color}-400`,
                    })}
                  </div>
                  <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Carousel */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Success Stories</h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hear from students and employers who have found success with StudentHunter
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div className="flex gap-6 py-4 animate-carousel-slow">
                {[...successStories, ...successStories].map((story, index) => (
                  <Card
                    key={index}
                    className="min-w-[350px] max-w-[350px] group hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl"
                  >
                    <div className={`h-1.5 w-full bg-${story.color}-500`}></div>
                    <CardContent className="pt-6 pb-4 px-5">
                      <div className="flex flex-col h-full">
                        <div className="mb-6">
                          <p className="italic text-gray-600 dark:text-gray-400 leading-relaxed">"{story.quote}"</p>
                        </div>
                        <div className="mt-auto flex items-center">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gray-200 dark:border-gray-700">
                            <Image
                              src={story.image || "/placeholder.svg"}
                              alt={story.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{story.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{story.role}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-gray-50 dark:bg-gray-800/50 py-2 px-5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Employers - iOS Style */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Featured Employers</h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join these leading companies in finding top student talent
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <Image
                  src={`/placeholder-logo.svg`}
                  width="120"
                  height="60"
                  alt={`Company logo ${index + 1}`}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Preview - iOS Style */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Career Resources</h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Access our library of resources to help you succeed in your job search
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careerResources.map((resource, index) => (
              <Card
                key={index}
                className="group hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-full bg-${resource.color}-100 dark:bg-${resource.color}-900/30 flex items-center justify-center mb-4`}
                  >
                    {React.createElement(resource.icon, {
                      className: `w-6 h-6 text-${resource.color}-500 dark:text-${resource.color}-400`,
                    })}
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{resource.description}</p>
                </CardContent>
                <CardFooter>
                  <Link href="/resources">
                    <Button
                      variant="outline"
                      className={`rounded-full group-hover:bg-${resource.color}-500 group-hover:text-white dark:group-hover:bg-${resource.color}-600 transition-colors duration-300`}
                    >
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/resources">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-sm"
              >
                Explore All Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - iOS Style */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"></div>
        <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 text-white/90">
              Join StudentHunter today and take the first step towards your dream career
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 dark:bg-white dark:text-blue-700 dark:hover:bg-gray-100 rounded-full shadow-lg"
                >
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 rounded-full shadow-lg"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
