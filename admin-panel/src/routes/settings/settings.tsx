import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

export const Settings = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/store", { replace: true })
    }
    if (location.pathname === "/settings/developer") {
      navigate("/settings/publishable-api-keys", { replace: true })
    }
  }, [location.pathname, navigate])

  return <Outlet />
}
