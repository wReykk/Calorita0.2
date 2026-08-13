import apiClient from '../assets/api/client'

export const waterService = {
    getDailyWater: async (date: string) => {
        const response = await apiClient.get(`/water/today?date=${date}`)
        return response.data
    },

    addWater: async (payload: { amount: number; date: string }) => {
        const response = await apiClient.post('/water', payload)
        return response.data
    },

    removeWater: async (amount: number, date: string) => {
        const response = await apiClient.delete(`/water/${amount}?date=${date}`)
        return response.data
    }
}