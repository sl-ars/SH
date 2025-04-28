"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, BarChart, PieChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { isMockEnabled } from "@/lib/utils/config"
import { mockReports } from "@/lib/mock-data/reports"
import type { CampusReport } from "@/lib/api/campus"

export default function CampusReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<CampusReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState("2024")

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchReports = async () => {
      try {
        setLoading(true)

        // Use mock data
        if (isMockEnabled()) {
          setReports(Object.values(mockReports))
        } else {
          // In a real implementation, we would fetch from the API
          // For now, we'll use the mock data even in non-mock mode
          setReports(Object.values(mockReports))
        }
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [user, router])

  const handleDownload = async (reportId: string) => {
    try {
      const report = reports.find((r) => r.id === reportId)
      if (report && report.url) {
        window.open(report.url, "_blank")
      }
    } catch (error) {
      console.error("Error downloading report:", error)
    }
  }

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Reports</h1>
            <div className="flex gap-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export All Reports
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Placement Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <PieChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <BarChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading reports...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            {report.name}
                          </div>
                        </TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell>{report.lastUpdated}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
