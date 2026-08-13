import type { DiaryEntry } from '../types/diary.types'

export function formatDateInput(date: Date): string {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function parseDateInput(value: string): Date {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function getConsumedNutrition(entry: DiaryEntry) {
    const multiplier = entry.pieceName ? (entry.amount || 0) : (entry.amount || 0) / 100

    return {
        calories: Math.round((entry.calories || 0) * multiplier),
        protein: Number((entry.protein || 0) * multiplier).toFixed(1),
        fat: Number((entry.fat || 0) * multiplier).toFixed(1),
        carbs: Number((entry.carbs || 0) * multiplier).toFixed(1),
    }
}