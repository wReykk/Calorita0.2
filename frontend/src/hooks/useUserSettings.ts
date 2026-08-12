import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'
import type { FormState, UserSettingsFormProps } from '../types/userSettings.types'
import {
    getInitialFormState,
    getStoredUser,
    formatDisplayDate,
    buildFormStateFromUser,
    getUserIdFromToken
} from '../utils/userSettings.utils'

export const useUserSettings = ({ isOnboarding = false, onSubmitSuccess }: Pick<UserSettingsFormProps, 'isOnboarding' | 'onSubmitSuccess'>) => {
    const { t } = useTranslation()

    const [form, setForm] = useState<FormState>(() => getInitialFormState())
    const [isSaving, setIsSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
        const storedUser = getStoredUser()
        return storedUser?.updatedAt ? formatDisplayDate(storedUser.updatedAt) : null
    })

    const handleChange = (field: keyof FormState) => (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setForm((current) => ({ ...current, [field]: event.target.value as FormState[keyof FormState] }))
    }

    // Автоматическое скрытие уведомлений
    useEffect(() => {
        if (!feedback) return undefined

        const timeoutId = window.setTimeout(() => {
            setFeedback(null)
        }, 4000)

        return () => window.clearTimeout(timeoutId)
    }, [feedback])

    // Подгрузка свежих данных
    useEffect(() => {
        const loadLatestUserData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const response = await apiClient.get('/users/me')
                const user = response.data?.user

                if (user) {
                    const nextFormState = buildFormStateFromUser(user)
                    setForm(nextFormState)
                    localStorage.setItem('user', JSON.stringify(user))
                    setLastUpdated(formatDisplayDate(user.updatedAt))
                }
            } catch {
                console.error('Failed to fetch latest user data')
            }
        }

        void loadLatestUserData()
    }, [])

    const isMaintainGoal = form.goal === 'MAINTAIN'

    const targetWeightValidationError = (() => {
        if (isMaintainGoal) return null

        const heightValue = Number(form.height)
        const targetWeightValue = Number(form.targetWeight)

        if (!form.height || Number.isNaN(heightValue) || heightValue <= 0) return null
        if (!form.targetWeight || Number.isNaN(targetWeightValue) || targetWeightValue <= 0) return null

        const heightInMeters = heightValue / 100
        const minWeight = Math.ceil(18.5 * (heightInMeters * heightInMeters))
        const maxWeight = Math.floor(30 * (heightInMeters * heightInMeters))
        const roundedMinWeight = Math.round(minWeight)
        const roundedMaxWeight = Math.round(maxWeight)

        if (targetWeightValue < minWeight) {
            return t('userSettings.errorMinWeight', 'Minimum safe weight for your height is {{min}} kg.', { min: roundedMinWeight })
        }

        if (targetWeightValue > maxWeight) {
            return t('userSettings.errorMaxWeight', 'Maximum allowed weight for your height is {{max}} kg.', { max: roundedMaxWeight })
        }

        return null
    })()

    const isSubmitDisabled = isSaving || (!isMaintainGoal && Boolean(targetWeightValidationError))

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!isMaintainGoal && targetWeightValidationError) {
            setFeedback({ type: 'error', message: targetWeightValidationError })
            return
        }

        setFeedback(null)
        setIsSaving(true)

        try {
            const userId = getUserIdFromToken()

            if (!userId) {
                throw new Error('Missing user id')
            }

            const payload = {
                height: Number(form.height),
                weight: Number(form.weight),
                dateOfBirth: new Date(form.dateOfBirth).toISOString(),
                sex: form.sex,
                activityLevel: form.activityLevel,
                goal: form.goal,
                targetWeight: isMaintainGoal ? null : Number(form.targetWeight),
                pace: isMaintainGoal ? 'MEDIUM' : form.pace,
            }

            const response = await apiClient.patch(`/users/${userId}/parameters`, payload)
            const updatedUser = response.data?.user
            const estimatedWeeksToGoal = response.data?.estimatedWeeksToGoal ?? null

            if (updatedUser) {
                localStorage.setItem('user', JSON.stringify(updatedUser))
                setLastUpdated(formatDisplayDate(updatedUser.updatedAt))
            }

            setFeedback({
                type: 'success',
                message:
                    estimatedWeeksToGoal !== null && estimatedWeeksToGoal !== undefined
                        ? t('userSettings.successWithEstimate', 'Settings saved! Estimated time to reach your goal: {{weeks}} weeks.', { weeks: estimatedWeeksToGoal })
                        : isOnboarding
                            ? t('userSettings.successOnboarding', 'Settings saved successfully! Redirecting...')
                            : t('userSettings.successSave', 'Settings saved successfully!'),
            })

            if (isOnboarding) {
                window.setTimeout(() => {
                    onSubmitSuccess?.()
                }, 1200)
            }
        } catch {
            setFeedback({ type: 'error', message: t('userSettings.errorSave', 'Unable to save your settings right now.') })
        } finally {
            setIsSaving(false)
        }
    }

    return {
        state: {
            form,
            isSaving,
            feedback,
            lastUpdated,
            isMaintainGoal,
            targetWeightValidationError,
            isSubmitDisabled
        },
        actions: {
            handleChange,
            handleSubmit
        }
    }
}