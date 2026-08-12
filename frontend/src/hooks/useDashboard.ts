import { useState, useEffect } from 'react'
import apiClient from '../assets/api/client'
import type { UserChartData, DashboardStats } from '../types/dashboard.types'

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
                const response = await apiClient.get('/users/me')
                setUserData(response.data.user)
                setStatsData(response.data.stats)
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