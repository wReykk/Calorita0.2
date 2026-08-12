export type DiaryEntry = {
    id: string
    amount: number
    date?: string
    name?: string
    calories?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
    pieceName?: string | null
}

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

export type Summary = {
    totalCalories: number
    totalProtein: number
    totalFat: number
    totalCarbs: number
}