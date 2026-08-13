import apiClient from '../assets/api/client'

export const diaryService = {
    getEntries: async () => {
        const response = await apiClient.get('/diary')
        return response.data
    },

    createEntry: async (payload: Record<string, unknown>) => {
        const response = await apiClient.post('/diary', payload)
        return response.data
    },

    updateEntry: async (id: string, payload: Record<string, unknown>) => {
        const response = await apiClient.put(`/diary/${id}`, payload)
        return response.data
    },

    deleteEntry: async (id: string) => {
        const response = await apiClient.delete(`/diary/${id}`)
        return response.data
    }
}