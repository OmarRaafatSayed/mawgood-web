import { Spinner } from "@medusajs/icons"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useMe } from "../../../hooks/api/users"
import { SearchProvider } from "../../../providers/search-provider"
import { SidebarProvider } from "../../../providers/sidebar-provider"
import { TalkjsProvider } from "../../../providers/talkjs-provider"

export const ProtectedRoute = () => {
  const { seller, isPending, error } = useMe()
  const location = useLocation()
  
  // Check if auth token exists
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('medusa_auth_token') : null
  const hasToken = !!token
  
  console.log("[ProtectedRoute] Token exists:", hasToken, token ? token.substring(0, 20) + "..." : "none")
  console.log("[ProtectedRoute] isPending:", isPending, "seller:", seller?.id, "error:", error?.message)
  
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ui-fg-interactive animate-spin" />
      </div>
    )
  }

  // If no token, redirect to login
  if (!hasToken) {
    console.log("[ProtectedRoute] No token, redirecting to login")
    return (
      <Navigate
        to="/login?reason=Session expired"
        state={{ from: location }}
        replace
      />
    )
  }

  // If we have token but error from useMe, check if it's a real auth error
  if (error && !seller) {
    const errorMessage = error?.message || ""
    console.log("[ProtectedRoute] Error from useMe:", errorMessage)
    
    const isAuthError = !errorMessage.includes("not active") && 
                        !errorMessage.includes("approved") &&
                        errorMessage !== ""
    
    if (isAuthError) {
      console.log("[ProtectedRoute] Auth error, clearing token and redirecting")
      localStorage.removeItem("medusa_auth_token")
      return (
        <Navigate
          to={`/login?reason=${encodeURIComponent(errorMessage)}`}
          state={{ from: location }}
          replace
        />
      )
    }
    // If not auth error, render anyway (might be network issue)
  }

  // Token exists, render protected content
  return (
    <TalkjsProvider>
      <SidebarProvider>
        <SearchProvider>
          <Outlet />
        </SearchProvider>
      </SidebarProvider>
    </TalkjsProvider>
  )
}
