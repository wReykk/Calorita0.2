import apiClient from '../assets/api/client'

export const productService = {
    getProducts: async () => {
        const response = await apiClient.get('/products')
        return response.data
    },

    createProduct: async (payload: Record<string, unknown>) => {
        const response = await apiClient.post('/products', payload)
        return response.data
    },

    updateProduct: async (id: number, payload: Record<string, unknown>) => {
        const response = await apiClient.put(`/products/${id}`, payload)
        return response.data
    },

    deleteProduct: async (id: number) => {
        const response = await apiClient.delete(`/products/${id}`)
        return response.data
    },

    searchProducts: async (query: string, lang: string) => {
        const token = localStorage.getItem('token')
        const response = await apiClient.get('/products/search', {
            params: { q: query, lang },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        return response.data
    }
}