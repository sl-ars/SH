"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { BarChart2, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw, Download } from "lucide-react"
import { analyzeResume } from "@/lib/api/resume"

interface ResumeAnalysisProps {
  resumeId: string
  summaryOnly?: boolean
}

export function ResumeAnalysis({ resumeId, summaryOnly = false }: ResumeAnalysisProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (resumeId) {
      fetchAnalysis()
    }
  }, [resumeId])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const result = await analyzeResume(resumeId)
      if (result.success) {
        setAnalysis(result.data)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to analyze resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error analyzing resume:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while analyzing your resume",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshAnalysis = async () => {
    try {
      setAnalyzing(true)
      await fetchAnalysis()
      toast({
        title: "Success",
        description: "Resume analysis refreshed successfully",
      })
    } catch (error) {
      console.error("Error refreshing analysis:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-vibrant-blue" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground text-center mb-6">
            We haven't analyzed this resume yet. Click below to start the analysis.
          </p>
          <Button onClick={handleRefreshAnalysis} disabled={analyzing}>
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart2 className="w-4 h-4 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If we only need the summary (for the resume details page)
  if (summaryOnly) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold">{analysis.overallScore}/100</p>
              <Progress
                value={analysis.overallScore}
                className="h-2 ml-2"
                indicatorClassName={`${analysis.overallScore > 70 ? "bg-green-500" : analysis.overallScore > 40 ? "bg-amber-500" : "bg-red-500"}`}
              />
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Skills Detected</p>
            <p className="text-2xl font-bold">{analysis.skills?.length || 0}</p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Improvement Areas</p>
            <p className="text-2xl font-bold">{analysis.improvementAreas?.length || 0}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {analysis.skills?.slice(0, 8).map((skill: string, index: number) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
          {analysis.skills?.length > 8 && <Badge variant="outline">+{analysis.skills.length - 8} more</Badge>}
        </div>

        <Button variant="outline" className="mt-4" onClick={() => setActiveTab("overview")}>
          View Full Analysis
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
        <CardHeader>
          <CardTitle className="flex items-center text-vibrant-blue">
            <BarChart2 className="w-5 h-5 mr-2" />
            Resume Analysis
          </CardTitle>
          <CardDescription>Comprehensive analysis of your resume to help you improve and stand out</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Overall Score</h3>
              <div className="flex items-center mt-2">
                <span
                  className={`text-3xl font-bold ${
                    analysis.overallScore > 70
                      ? "text-green-600"
                      : analysis.overallScore > 40
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {analysis.overallScore}/100
                </span>
                <div className="ml-4 w-40">
                  <Progress
                    value={analysis.overallScore}
                    className="h-3"
                    indicatorClassName={`${
                      analysis.overallScore > 70
                        ? "bg-green-500"
                        : analysis.overallScore > 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRefreshAnalysis} disabled={analyzing}>
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="ml-2">Refresh Analysis</span>
              </Button>

              <Button variant="outline" asChild>
                <a href={`/api/resume/analysis/${resumeId}/export`} download={`resume-analysis-${resumeId}.pdf`}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </a>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths?.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                      {(!analysis.strengths || analysis.strengths.length === 0) && (
                        <li className="text-muted-foreground">No strengths identified</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Improvement Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.improvementAreas?.map((area: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                          <span>{area}</span>
                        </li>
                      ))}
                      {(!analysis.improvementAreas || analysis.improvementAreas.length === 0) && (
                        <li className="text-muted-foreground">No improvement areas identified</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skills Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills?.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {(!analysis.skills || analysis.skills.length === 0) && (
                      <p className="text-muted-foreground">No skills detected</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Alert
                className={`${
                  analysis.overallScore > 70 ? "bg-green-50" : analysis.overallScore > 40 ? "bg-amber-50" : "bg-red-50"
                }`}
              >
                <div
                  className={`${
                    analysis.overallScore > 70
                      ? "text-green-800"
                      : analysis.overallScore > 40
                        ? "text-amber-800"
                        : "text-red-800"
                  } flex items-center`}
                >
                  {analysis.overallScore > 70 ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : analysis.overallScore > 40 ? (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  <AlertTitle>
                    {analysis.overallScore > 70
                      ? "Great Resume!"
                      : analysis.overallScore > 40
                        ? "Resume Needs Improvement"
                        : "Resume Needs Significant Improvement"}
                  </AlertTitle>
                </div>
                <AlertDescription
                  className={`${
                    analysis.overallScore > 70
                      ? "text-green-700"
                      : analysis.overallScore > 40
                        ? "text-amber-700"
                        : "text-red-700"
                  } mt-2`}
                >
                  {analysis.summary || "No summary available"}
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Experience Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center mt-1">
                        <p className="font-bold">{analysis.sections?.experience?.score || 0}/100</p>
                        <Progress value={analysis.sections?.experience?.score || 0} className="h-2 ml-2 w-32" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <ul className="mt-2 space-y-2">
                        {analysis.sections?.experience?.feedback?.map((item: string, index: number) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        ))}
                        {(!analysis.sections?.experience?.feedback ||
                          analysis.sections.experience.feedback.length === 0) && (
                          <li className="text-sm text-muted-foreground">No feedback available</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Education Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center mt-1">
                        <p className="font-bold">{analysis.sections?.education?.score || 0}/100</p>
                        <Progress value={analysis.sections?.education?.score || 0} className="h-2 ml-2 w-32" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <ul className="mt-2 space-y-2">
                        {analysis.sections?.education?.feedback?.map((item: string, index: number) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        ))}
                        {(!analysis.sections?.education?.feedback ||
                          analysis.sections.education.feedback.length === 0) && (
                          <li className="text-sm text-muted-foreground">No feedback available</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skills Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center mt-1">
                        <p className="font-bold">{analysis.sections?.skills?.score || 0}/100</p>
                        <Progress value={analysis.sections?.skills?.score || 0} className="h-2 ml-2 w-32" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <ul className="mt-2 space-y-2">
                        {analysis.sections?.skills?.feedback?.map((item: string, index: number) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        ))}
                        {(!analysis.sections?.skills?.feedback || analysis.sections.skills.feedback.length === 0) && (
                          <li className="text-sm text-muted-foreground">No feedback available</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Summary/Objective</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center mt-1">
                        <p className="font-bold">{analysis.sections?.summary?.score || 0}/100</p>
                        <Progress value={analysis.sections?.summary?.score || 0} className="h-2 ml-2 w-32" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <ul className="mt-2 space-y-2">
                        {analysis.sections?.summary?.feedback?.map((item: string, index: number) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        ))}
                        {(!analysis.sections?.summary?.feedback || analysis.sections.summary.feedback.length === 0) && (
                          <li className="text-sm text-muted-foreground">No feedback available</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Format Tab */}
            <TabsContent value="format" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Layout & Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center mt-1">
                        <p className="font-bold">{analysis.format?.layout?.score || 0}/100</p>
                        <Progress value={analysis.format?.layout?.score || 0} className="h-2 ml-2 w-32" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <ul className="mt-2 space-y-2">
                        {analysis.format?.layout?.feedback?.map((item: string, index: number) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        ))}
                        {(!analysis.format?.layout?.feedback || analysis.format.layout.feedback.length === 0) && (
                          <li className="text-sm text-muted-foreground">No feedback available</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Readability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center mt-1">
                        <p className="font-bold">{analysis.format?.readability?.score || 0}/100</p>
                        <Progress value={analysis.format?.readability?.score || 0} className="h-2 ml-2 w-32" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <ul className="mt-2 space-y-2">
                        {analysis.format?.readability?.feedback?.map((item: string, index: number) => (
                          <li key={index} className="text-sm">
                            {item}
                          </li>
                        ))}
                        {(!analysis.format?.readability?.feedback ||
                          analysis.format.readability.feedback.length === 0) && (
                          <li className="text-sm text-muted-foreground">No feedback available</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Length & Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pages</p>
                      <p className="text-lg font-bold">{analysis.format?.pages || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Word Count</p>
                      <p className="text-lg font-bold">{analysis.format?.wordCount || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Bullet Points</p>
                      <p className="text-lg font-bold">{analysis.format?.bulletPoints || "N/A"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium">Recommendations</p>
                    <ul className="mt-2 space-y-2">
                      {analysis.format?.recommendations?.map((item: string, index: number) => (
                        <li key={index} className="text-sm">
                          {item}
                        </li>
                      ))}
                      {(!analysis.format?.recommendations || analysis.format.recommendations.length === 0) && (
                        <li className="text-sm text-muted-foreground">No recommendations available</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ATS Compatibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ATS Score</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xl font-bold">{analysis.ats?.score || 0}/100</p>
                      <Progress
                        value={analysis.ats?.score || 0}
                        className="h-2 ml-4 w-40"
                        indicatorClassName={`${
                          (analysis.ats?.score || 0) > 70
                            ? "bg-green-500"
                            : (analysis.ats?.score || 0) > 40
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>

                  <Alert
                    className={`${
                      (analysis.ats?.score || 0) > 70
                        ? "bg-green-50"
                        : (analysis.ats?.score || 0) > 40
                          ? "bg-amber-50"
                          : "bg-red-50"
                    }`}
                  >
                    <AlertTitle
                      className={`${
                        (analysis.ats?.score || 0) > 70
                          ? "text-green-800"
                          : (analysis.ats?.score || 0) > 40
                            ? "text-amber-800"
                            : "text-red-800"
                      }`}
                    >
                      {(analysis.ats?.score || 0) > 70
                        ? "ATS-Friendly Resume"
                        : (analysis.ats?.score || 0) > 40
                          ? "Moderate ATS Compatibility"
                          : "Poor ATS Compatibility"}
                    </AlertTitle>
                    <AlertDescription
                      className={`${
                        (analysis.ats?.score || 0) > 70
                          ? "text-green-700"
                          : (analysis.ats?.score || 0) > 40
                            ? "text-amber-700"
                            : "text-red-700"
                      } mt-2`}
                    >
                      {analysis.ats?.summary || "No ATS compatibility information available"}
                    </AlertDescription>
                  </Alert>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium">Industry Keywords</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.keywords?.industry?.map((keyword: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={
                            analysis.keywords?.found?.includes(keyword)
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {keyword}
                          {analysis.keywords?.found?.includes(keyword) ? (
                            <CheckCircle className="w-3 h-3 ml-1" />
                          ) : (
                            <XCircle className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                      {(!analysis.keywords?.industry || analysis.keywords.industry.length === 0) && (
                        <p className="text-sm text-muted-foreground">No industry keywords available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Skill Keywords</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.keywords?.skills?.map((keyword: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={
                            analysis.keywords?.found?.includes(keyword)
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {keyword}
                          {analysis.keywords?.found?.includes(keyword) ? (
                            <CheckCircle className="w-3 h-3 ml-1" />
                          ) : (
                            <XCircle className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                      {(!analysis.keywords?.skills || analysis.keywords.skills.length === 0) && (
                        <p className="text-sm text-muted-foreground">No skill keywords available</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium">Recommendations</p>
                    <ul className="mt-2 space-y-2">
                      {analysis.ats?.recommendations?.map((item: string, index: number) => (
                        <li key={index} className="text-sm">
                          {item}
                        </li>
                      ))}
                      {(!analysis.ats?.recommendations || analysis.ats.recommendations.length === 0) && (
                        <li className="text-sm text-muted-foreground">No recommendations available</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
