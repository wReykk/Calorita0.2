export type ProductOption = {
    id: string
    name: string
    calories?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
    externalId?: string
    servingDescription?: string | null
    description?: string
    isGlobal?: boolean
    pieceName?: string | null
}

export type Ingredient = ProductOption & {
    productId: string
    amount: number
}