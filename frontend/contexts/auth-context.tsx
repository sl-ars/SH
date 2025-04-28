"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { User, UserRole } from "@/lib/types"
import { toast } from "sonner"

// Token refresh interval in milliseconds (20 minutes)
const TOKEN_REFRESH_INTERVAL = 20 * 60 * 1000;

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, redirectPath?: string) => Promise<boolean>
  logout: () => void
  register: (userData: any, redirectPath?: string) => Promise<boolean>
  hasRole: (roles: string | string[]) => boolean
  refreshUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Define redirectBasedOnRole function
  const redirectBasedOnRole = (role: UserRole) => {
    // Placeholder implementation: customize as needed
    console.log(`Redirecting based on role: ${role}`);
    switch (role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'employer':
        router.push('/employer/dashboard');
        break;
      case 'campus':
        router.push('/campus/dashboard');
        break;
      case 'student':
        router.push('/student/dashboard'); // Or /profile or /jobs
        break;
      default:
        router.push('/profile'); // Default redirect
    }
  };

  const isUserRole = (role: string): role is UserRole => {
    return role === 'admin' || role === 'employer' || role === 'campus' || role === 'student'
  }

  // Function to refresh the access token
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return false

      const response = await authApi.refreshToken(refreshToken)
      if (response.access) {
        localStorage.setItem('access_token', response.access)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  const refreshUserInfo = async (): Promise<void> => {
    try {
      console.log('Refreshing user info...')
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.warn('No token available to refresh user info')
        return
      }

      const response = await authApi.verifyToken(token)
      if (response.status === 'success' && response.data?.is_valid && response.data?.user) {
        const userData = response.data.user
        console.log('Updated user data:', userData)

        // Update user state with refreshed data
        if (user) {
          setUser((prevUser) => prevUser ? {
            ...prevUser,
            company: userData.company,
            company_id: userData.company_id,
            name: userData.name || prevUser.name,
            avatar: userData.avatar || prevUser.avatar,
          } : null);
          console.log('User info refreshed with new company data')
        }
      } else {
        console.warn('Failed to refresh user info, invalid response:', response)
      }
    } catch (error) {
      console.error('Error refreshing user info:', error)
    }
  }

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      console.log('Checking auth with token:', token ? 'exists' : 'missing')
      
      if (!token) {
        // Try to use refresh token if available
        const hasRefreshed = await refreshAccessToken()
        if (!hasRefreshed) {
          setUser(null)
          if (pathname !== '/login' && !pathname.startsWith('/public/')) {
            // Store current path for redirection after login
            sessionStorage.setItem("authRedirect", pathname)
            router.push('/login')
          }
          return
        }
      }

      // Get the possibly refreshed token
      const currentToken = localStorage.getItem('access_token')
      
      try {
        const response = await authApi.verifyToken(currentToken || '')
        console.log('[checkAuth] Raw auth verification response object:', JSON.parse(JSON.stringify(response))); // Log a snapshot

        const isSuccess = response.status === 'success';
        // Explicitly use snake_case 'is_valid' from the API response, matching VerifyResponse type
        const isValidInPayload = response.data?.is_valid !== undefined && String(response.data.is_valid).toLowerCase() === 'true';
        const userObjectFromResponse = response.data?.user; // This is snake_case from API
        const userIsTruthy = !!userObjectFromResponse;

        console.log('[checkAuth] Condition parts - isSuccess:', isSuccess, 'isValidInPayload:', isValidInPayload, 'userIsTruthy:', userIsTruthy, 'userObjectFromResponse:', userObjectFromResponse);
        
        if (isSuccess && isValidInPayload && userIsTruthy && userObjectFromResponse) {
          console.log('[checkAuth] Token verified successfully. Setting user.');
          const apiUserData = userObjectFromResponse; // alias for clarity
          
          // Map snake_case from API to camelCase for frontend User type
          const role = apiUserData.role as UserRole;
          if (role !== 'admin' && role !== 'employer' && role !== 'campus' && role !== 'student') {
            console.error('[checkAuth] Invalid role after verification:', role);
            setUser(null);
            localStorage.removeItem('access_token');
            if (pathname !== '/login' && !pathname.startsWith('/public/')) {
              router.push('/login');
            }
            return;
          }

          setUser({
            id: String(apiUserData.id),
            email: apiUserData.email,
            name: apiUserData.name || (apiUserData.first_name && apiUserData.last_name ? `${apiUserData.first_name} ${apiUserData.last_name}`.trim() : undefined),
            role: role,
            avatar: apiUserData.avatar,
            company: apiUserData.company,
            company_id: apiUserData.company_id,
            isActive: apiUserData.is_active,
            createdAt: apiUserData.created_at || apiUserData.date_joined,
            first_name: apiUserData.first_name,
            last_name: apiUserData.last_name,
          });
          console.log('[checkAuth] User state set.');

          if (pathname === '/login') {
            console.log('[checkAuth] On login page, redirecting based on role:', role);
            redirectBasedOnRole(role);
          }
        } else {
          console.warn('[checkAuth] Token verification failed. Details - isSuccess:', isSuccess, 'isValidInPayload:', isValidInPayload, 'userIsTruthy:', userIsTruthy, 'Actual user object from response.data:', response.data?.user);
          // Token invalid, try to refresh
          const hasRefreshed = await refreshAccessToken()
          if (hasRefreshed) {
            // Check auth again with new token
            const newToken = localStorage.getItem('access_token');
            if (newToken) {
              try {
                const newResponse = await authApi.verifyToken(newToken);
                // Use is_valid here to match VerifyResponse type
                if (newResponse.status === 'success' && newResponse.data?.is_valid && newResponse.data?.user) {
                  const apiRefreshedUserData = newResponse.data.user; 
                  const role = apiRefreshedUserData.role as UserRole;
                  if (role !== 'admin' && role !== 'employer' && role !== 'campus' && role !== 'student') {
                    console.error('Invalid role after refresh:', role);
                    setUser(null);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                      router.push('/login');
                    }
                  } else {
                    const apiRefreshedUserData = newResponse.data.user; 
                    setUser({
                        id: String(apiRefreshedUserData.id),
                        email: apiRefreshedUserData.email,
                        name: apiRefreshedUserData.name || (apiRefreshedUserData.first_name && apiRefreshedUserData.last_name ? `${apiRefreshedUserData.first_name} ${apiRefreshedUserData.last_name}`.trim() : undefined),
                        role: apiRefreshedUserData.role as UserRole,
                        avatar: apiRefreshedUserData.avatar,
                        company: apiRefreshedUserData.company,
                        company_id: apiRefreshedUserData.company_id,
                        isActive: apiRefreshedUserData.is_active,
                        createdAt: apiRefreshedUserData.created_at || apiRefreshedUserData.date_joined,
                        first_name: apiRefreshedUserData.first_name,
                        last_name: apiRefreshedUserData.last_name,
                    });
                    if (pathname === '/login') {
                      redirectBasedOnRole(role);
                    }
                  }
                } else {
                  // Verification of new token failed
                  setUser(null)
                  localStorage.removeItem('access_token')
                  localStorage.removeItem('refresh_token')
                  if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                    router.push('/login')
                  }
                }
              } catch (e) {
                // Error verifying new token
                setUser(null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                  router.push('/login')
                }
              }
            } else {
                // No new token found after refresh (should not happen if hasRefreshed is true)
                setUser(null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                  router.push('/login')
                }
            }
          } else {
            setUser(null)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (pathname !== '/login' && !pathname.startsWith('/public/')) {
              router.push('/login')
            }
          }
        }
      } catch (verifyError) {
        console.error('[checkAuth] Error during token verification process (verifyError block):', verifyError);
        // Token validation failed, try to refresh
        const hasRefreshed = await refreshAccessToken()
        if (hasRefreshed) {
          // Check auth again with new token
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            try {
              const newResponse = await authApi.verifyToken(newToken);
              // Use is_valid here to match VerifyResponse type
              if (newResponse.status === 'success' && newResponse.data?.is_valid && newResponse.data?.user) {
                const apiRefreshedUserData = newResponse.data.user; 
                const role = apiRefreshedUserData.role as UserRole;
                if (role !== 'admin' && role !== 'employer' && role !== 'campus' && role !== 'student') {
                  console.error('Invalid role after refresh:', role);
                  setUser(null);
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                    router.push('/login');
                  }
                } else {
                  const apiRefreshedUserData = newResponse.data.user; 
                  setUser({
                      id: String(apiRefreshedUserData.id),
                      email: apiRefreshedUserData.email,
                      name: apiRefreshedUserData.name || (apiRefreshedUserData.first_name && apiRefreshedUserData.last_name ? `${apiRefreshedUserData.first_name} ${apiRefreshedUserData.last_name}`.trim() : undefined),
                      role: apiRefreshedUserData.role as UserRole,
                      avatar: apiRefreshedUserData.avatar,
                      company: apiRefreshedUserData.company,
                      company_id: apiRefreshedUserData.company_id,
                      isActive: apiRefreshedUserData.is_active,
                      createdAt: apiRefreshedUserData.created_at || apiRefreshedUserData.date_joined,
                      first_name: apiRefreshedUserData.first_name,
                      last_name: apiRefreshedUserData.last_name,
                  });
                  if (pathname === '/login') {
                    redirectBasedOnRole(role);
                  }
                }
              } else {
                // Verification of new token failed
                setUser(null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                  router.push('/login')
                }
              }
            } catch (e) {
              // Error verifying new token
              setUser(null)
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                router.push('/login')
              }
            }
          } else {
              // No new token found after refresh (should not happen if hasRefreshed is true)
              setUser(null)
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              if (pathname !== '/login' && !pathname.startsWith('/public/')) {
                router.push('/login')
              }
          }
        } else {
          setUser(null)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (pathname !== '/login' && !pathname.startsWith('/public/')) {
            router.push('/login')
          }
        }
      }
    } catch (error) {
      console.error('[checkAuth] General error in checkAuth (outer catch block):', error);
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      if (pathname !== '/login' && !pathname.startsWith('/public/')) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Set up automatic token refresh
  useEffect(() => {
    // Only set up refresh timer if user is authenticated
    if (user) {
      const refreshIntervalId = setInterval(async () => {
        console.log("Attempting scheduled token refresh...");
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          console.error("Scheduled token refresh failed. Logging out.");
          toast.error("Your session has expired. Please log in again.", { duration: 5000 });
          logout(); // Call the main logout function to clear state and redirect
        }
      }, TOKEN_REFRESH_INTERVAL);
      return () => clearInterval(refreshIntervalId);
    }
  }, [user]);

  useEffect(() => {
    console.log("AuthProvider mounted. Calling checkAuth.");
    checkAuth();
  }, []); // Empty dependency array: runs once on mount

  const login = async (email: string, password: string, redirectPath?: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password })
      
      if (response.access) {
        localStorage.setItem('access_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)
        
        setUser({
          ...response.user,
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role as UserRole,
          avatar: response.user.avatar,
          company: response.user.company,
          company_id: response.user.company_id,
          createdAt: new Date().toISOString(),
          isActive: true
        })
        
        const redirectTo = redirectPath || sessionStorage.getItem("authRedirect")
        if (redirectTo) {
          router.push(redirectTo)
          sessionStorage.removeItem("authRedirect")
        } else {
          router.push("/profile")
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    router.push('/login')
  }

  const register = async (userData: any, redirectPath?: string): Promise<boolean> => {
    try {
      const response = await authApi.register(userData)
      
      if (response.success) {
        const loginResponse = await authApi.login({
          email: userData.email,
          password: userData.password,
        })

        if (loginResponse.access) {
          localStorage.setItem('access_token', loginResponse.access)
          localStorage.setItem('refresh_token', loginResponse.refresh)
          
          setUser({
            ...loginResponse.user,
            id: loginResponse.user.id,
            email: loginResponse.user.email,
            name: loginResponse.user.name,
            role: loginResponse.user.role as UserRole,
            avatar: loginResponse.user.avatar,
            company: loginResponse.user.company,
            company_id: loginResponse.user.company_id,
            createdAt: new Date().toISOString(),
            isActive: true
          })
          
          const redirectTo = redirectPath || sessionStorage.getItem("authRedirect")
          if (redirectTo) {
            router.push(redirectTo)
            sessionStorage.removeItem("authRedirect")
          } else {
            router.push("/profile")
          }

          return true
        }
      }

      return false
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    hasRole,
    refreshUserInfo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
