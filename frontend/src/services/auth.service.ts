import apiClient from '../assets/api/client'

export const authService = {
    login: async (payload: Record<string, unknown>) => {
        const response = await apiClient.post('/auth/login', payload)
        return response.data
    },

    register: async (payload: Record<string, unknown>) => {
        const response = await apiClient.post('/auth/register', payload)
        return response.data
    }
}