"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DemoAccounts() {
  const { getDemoAccounts, login, isMockMode } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [selectedRole, setSelectedRole] = useState("student")

  // If mock mode is not enabled, don't render anything
  if (!isMockMode) {
    return null
  }

  const demoAccounts = getDemoAccounts()

  // Group accounts by role
  const accountsByRole = demoAccounts.reduce(
    (acc, account) => {
      if (!acc[account.role]) {
        acc[account.role] = []
      }
      acc[account.role].push(account)
      return acc
    },
    {} as Record<string, typeof demoAccounts>,
  )

  // Get available roles
  const roles = Object.keys(accountsByRole)

  const handleDemoLogin = async (email: string, password: string) => {
    setIsLoggingIn(true)
    try {
      await login(email, password)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Demo Accounts</CardTitle>
        <CardDescription>These accounts are only available in demo mode. Click to login instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={roles[0]} value={selectedRole} onValueChange={setSelectedRole}>
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${roles.length}, 1fr)` }}>
            {roles.map((role) => (
              <TabsTrigger key={role} value={role} className="capitalize">
                {role}
              </TabsTrigger>
            ))}
          </TabsList>

          {roles.map((role) => (
            <TabsContent key={role} value={role} className="space-y-4">
              {accountsByRole[role].map((account) => (
                <div key={account.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">{account.email}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </Button>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
