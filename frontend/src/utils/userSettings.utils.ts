import type { FormState } from '../types/userSettings.types'

export const initialFormState: FormState = {
    height: '',
    weight: '',
    dateOfBirth: '',
    sex: 'MALE',
    activityLevel: 'MODERATE',
    goal: 'MAINTAIN',
    targetWeight: '',
    pace: 'MEDIUM',
}

export const formatDateForInput = (value?: string | null) => {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value.split('T')[0] ?? ''
    }

    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

export const formatDisplayDate = (value?: string | null) => {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export const getStoredUser = () => {
    try {
        const storedUser = localStorage.getItem('user')
        return storedUser ? JSON.parse(storedUser) : null
    } catch {
        return null
    }
}

export const buildFormStateFromUser = (user: Record<string, unknown> | null | undefined): FormState => {
    if (!user) return initialFormState

    const targetWeightValue = user.targetWeight ?? user.targetWeigth

    return {
        height: user.height?.toString() ?? '',
        weight: user.weight?.toString() ?? '',
        dateOfBirth: formatDateForInput(user.dateOfBirth as string | null | undefined),
        sex: user.sex === 'FEMALE' ? 'FEMALE' : 'MALE',
        activityLevel: ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'].includes(user.activityLevel as string)
            ? (user.activityLevel as FormState['activityLevel'])
            : 'MODERATE',
        goal: ['LOSE', 'MAINTAIN', 'GAIN'].includes(user.goal as string)
            ? (user.goal as FormState['goal'])
            : 'MAINTAIN',
        targetWeight: targetWeightValue?.toString() ?? '',
        pace: ['EASY', 'MEDIUM', 'HARD'].includes(user.pace as string)
            ? (user.pace as FormState['pace'])
            : 'MEDIUM',
    }
}

export const getInitialFormState = (): FormState => {
    const storedUser = getStoredUser()
    return buildFormStateFromUser(storedUser)
}

export const getUserIdFromToken = () => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) return storedUserId

    const token = localStorage.getItem('token')
    if (!token) return null

    try {
        const [, payload] = token.split('.')
        if (!payload) return null

        const decodedPayload = JSON.parse(atob(payload))
        return decodedPayload.userId ?? null
    } catch {
        return null
    }
}