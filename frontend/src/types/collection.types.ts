export type Product = {
    id: number
    name: string
    calories?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
    description?: string | null
}

export type ProductFormState = {
    name: string
    calories: string
    protein: string
    fat: string
    carbs: string
}

export type EditState = {
    productId: number | null
    values: ProductFormState
}