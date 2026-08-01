import { Navigate, Outlet, useLocation } from 'react-router-dom'

const hasRequiredProfileData = () => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
        return false
    }

    try {
        const user = JSON.parse(storedUser)
        return Boolean(user?.weight && user?.height && user?.goal)
    } catch {
        return false
    }
}

function ProtectedRoute() {
    const token = localStorage.getItem('token')
    const location = useLocation()

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (!hasRequiredProfileData() && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
