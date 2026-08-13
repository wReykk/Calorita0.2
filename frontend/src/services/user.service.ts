import apiClient from '../assets/api/client'

export const userService = {
    getMe: async () => {
        const response = await apiClient.get('/users/me')
        return response.data
    },

    updateParameters: async (userId: string, payload: Record<string, unknown>) => {
        const response = await apiClient.patch(`/users/${userId}/parameters`, payload)
        return response.data
    }
}