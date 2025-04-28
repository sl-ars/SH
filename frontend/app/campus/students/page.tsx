"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, User, GraduationCap, ExternalLink } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { isMockEnabled } from "@/lib/utils/config"
import { mockStudents } from "@/lib/mock-data/students"
import type { Student } from "@/lib/api/campus"

export default function CampusStudentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchStudents = async () => {
      try {
        setLoading(true)

        // Use mock data
        if (isMockEnabled()) {
          const mockData = Object.values(mockStudents)
          const filteredStudents = searchTerm
            ? mockData.filter(
                (student) =>
                  student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.major.toLowerCase().includes(searchTerm.toLowerCase()),
              )
            : mockData

          setStudents(filteredStudents)
        } else {
          // In a real implementation, we would fetch from the API
          // For now, we'll use the mock data even in non-mock mode
          const mockData = Object.values(mockStudents)
          const filteredStudents = searchTerm
            ? mockData.filter(
                (student) =>
                  student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.major.toLowerCase().includes(searchTerm.toLowerCase()),
              )
            : mockData

          setStudents(filteredStudents)
        }
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [user, router, searchTerm])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Student Directory</h1>
            <Link href="/campus/register">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </Link>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search students"
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Loading students...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Graduation Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {student.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            {student.major}
                          </div>
                        </TableCell>
                        <TableCell>{student.graduationYear}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              student.status === "Active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {student.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/campus/students/edit/${student.id}`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/students/${student.id}`}>
                              <Button size="icon" variant="ghost">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
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
