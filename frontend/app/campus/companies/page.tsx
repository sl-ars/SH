"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Building2, MapPin, Users, ExternalLink } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { isMockEnabled } from "@/lib/utils/config"
import { mockCompanies } from "@/lib/mock-data/companies"

interface Company {
  id: string
  name: string
  location: string
  size: string
  status: string
}

export default function CampusCompaniesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchCompanies = async () => {
      try {
        setLoading(true)

        // Use mock data
        if (isMockEnabled()) {
          // Convert mockCompanies object to array and add status
          const mockData = Object.values(mockCompanies).map((company) => ({
            id: company.id,
            name: company.name,
            location: company.location || "Unknown",
            size: company.size || "Unknown",
            status: "Active", // Adding a default status
          }))

          const filteredCompanies = searchTerm
            ? mockData.filter(
                (company) =>
                  company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  company.location.toLowerCase().includes(searchTerm.toLowerCase()),
              )
            : mockData

          setCompanies(filteredCompanies)
        } else {
          // In a real implementation, we would fetch from the API
          // For now, we'll use the mock data even in non-mock mode
          const mockData = Object.values(mockCompanies).map((company) => ({
            id: company.id,
            name: company.name,
            location: company.location || "Unknown",
            size: company.size || "Unknown",
            status: "Active", // Adding a default status
          }))

          const filteredCompanies = searchTerm
            ? mockData.filter(
                (company) =>
                  company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  company.location.toLowerCase().includes(searchTerm.toLowerCase()),
              )
            : mockData

          setCompanies(filteredCompanies)
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [user, router, searchTerm])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Partner Companies</h1>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search companies"
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
                <div className="p-4 text-center">Loading companies...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            {company.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {company.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {company.size}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              company.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {company.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/campus/companies/edit/${company.id}`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/companies/${company.id}`}>
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
