import { useState, useEffect } from 'react'
import type { UserChartData, DashboardStats } from '../types/dashboard.types'
import { userService } from '../services/user.service'

export const useDashboard = () => {
    const isLoggedIn = Boolean(localStorage.getItem('token'))
    const [userData, setUserData] = useState<UserChartData | null>(null)
    const [statsData, setStatsData] = useState<DashboardStats | null>(null)
    const [isLoadingData, setIsLoadingData] = useState(false)

    useEffect(() => {
        if (!isLoggedIn) return

        const fetchUserData = async () => {
            setIsLoadingData(true)
            try {
                const data = await userService.getMe()
                setUserData(data.user)
                setStatsData(data.stats)
            } catch (error) {
                console.error('Failed to fetch user data for chart:', error)
            } finally {
                setIsLoadingData(false)
            }
        }

        void fetchUserData()
    }, [isLoggedIn])

    return {
        isLoggedIn,
        userData,
        statsData,
        isLoadingData
    }
}