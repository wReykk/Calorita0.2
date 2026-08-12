export type FormState = {
    height: string
    weight: string
    dateOfBirth: string
    sex: 'MALE' | 'FEMALE'
    activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE'
    goal: 'LOSE' | 'MAINTAIN' | 'GAIN'
    targetWeight: string
    pace: 'EASY' | 'MEDIUM' | 'HARD'
}

export type UserSettingsFormProps = {
    isOnboarding?: boolean
    onSubmitSuccess?: () => void
    submitLabel?: string
}