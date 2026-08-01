import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import apiClient from '../assets/api/client'

type FormState = {
    height: string
    weight: string
    dateOfBirth: string
    sex: 'MALE' | 'FEMALE'
    activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE'
    goal: 'LOSE' | 'MAINTAIN' | 'GAIN'
    targetWeight: string
    pace: 'EASY' | 'MEDIUM' | 'HARD'
}

type UserSettingsFormProps = {
    isOnboarding?: boolean
    onSubmitSuccess?: () => void
    submitLabel?: string
}

const initialFormState: FormState = {
    height: '',
    weight: '',
    dateOfBirth: '',
    sex: 'MALE',
    activityLevel: 'MODERATE',
    goal: 'MAINTAIN',
    targetWeight: '',
    pace: 'MEDIUM',
}

const formatDateForInput = (value?: string | null) => {
    if (!value) {
        return ''
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value.split('T')[0] ?? ''
    }

    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const formatDisplayDate = (value?: string | null) => {
    if (!value) {
        return ''
    }

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

const getStoredUser = () => {
    try {
        const storedUser = localStorage.getItem('user')
        return storedUser ? JSON.parse(storedUser) : null
    } catch {
        return null
    }
}

const buildFormStateFromUser = (user: Record<string, unknown> | null | undefined): FormState => {
    if (!user) {
        return initialFormState
    }

    const targetWeightValue = (user as Record<string, unknown>).targetWeight ?? (user as Record<string, unknown>).targetWeigth

    return {
        height: (user as Record<string, unknown>).height?.toString() ?? '',
        weight: (user as Record<string, unknown>).weight?.toString() ?? '',
        dateOfBirth: formatDateForInput((user as Record<string, unknown>).dateOfBirth as string | null | undefined),
        sex: (user as Record<string, unknown>).sex === 'FEMALE' ? 'FEMALE' : 'MALE',
        activityLevel: ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'].includes((user as Record<string, unknown>).activityLevel as string)
            ? ((user as Record<string, unknown>).activityLevel as FormState['activityLevel'])
            : 'MODERATE',
        goal: ['LOSE', 'MAINTAIN', 'GAIN'].includes((user as Record<string, unknown>).goal as string)
            ? ((user as Record<string, unknown>).goal as FormState['goal'])
            : 'MAINTAIN',
        targetWeight: targetWeightValue?.toString() ?? '',
        pace: ['EASY', 'MEDIUM', 'HARD'].includes((user as Record<string, unknown>).pace as string)
            ? ((user as Record<string, unknown>).pace as FormState['pace'])
            : 'MEDIUM',
    }
}

const getInitialFormState = (): FormState => {
    const storedUser = getStoredUser()
    return buildFormStateFromUser(storedUser)
}

function UserSettingsForm({ isOnboarding = false, onSubmitSuccess, submitLabel = 'Save settings' }: UserSettingsFormProps) {
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

    useEffect(() => {
        if (!feedback) {
            return undefined
        }

        const timeoutId = window.setTimeout(() => {
            setFeedback(null)
        }, 4000)

        return () => window.clearTimeout(timeoutId)
    }, [feedback])

    useEffect(() => {
        const loadLatestUserData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    return
                }

                const response = await apiClient.get('/users/me')
                const user = response.data?.user

                if (user) {
                    const nextFormState = buildFormStateFromUser(user)
                    setForm(nextFormState)
                    localStorage.setItem('user', JSON.stringify(user))
                    setLastUpdated(formatDisplayDate(user.updatedAt))
                }
            } catch {
                // Keep the existing local values if the request fails.
            }
        }

        void loadLatestUserData()
    }, [])

    const isMaintainGoal = form.goal === 'MAINTAIN'

    const targetWeightValidationError = (() => {
        if (isMaintainGoal) {
            return null
        }

        const heightValue = Number(form.height)
        const targetWeightValue = Number(form.targetWeight)

        if (!form.height || Number.isNaN(heightValue) || heightValue <= 0) {
            return null
        }

        if (!form.targetWeight || Number.isNaN(targetWeightValue) || targetWeightValue <= 0) {
            return null
        }

        const heightInMeters = heightValue / 100
        const minWeight = Math.ceil(18.5 * (heightInMeters * heightInMeters));
        const maxWeight = Math.floor(30 * (heightInMeters * heightInMeters));
        const roundedMinWeight = Math.round(minWeight)
        const roundedMaxWeight = Math.round(maxWeight)

        if (targetWeightValue < minWeight) {
            return `Minimum safe weight for your height is ${roundedMinWeight} kg.`
        }

        if (targetWeightValue > maxWeight) {
            return `Maximum allowed weight for your height is ${roundedMaxWeight} kg.`
        }

        return null
    })()

    const isSubmitDisabled = isSaving || (!isMaintainGoal && Boolean(targetWeightValidationError))

    const getUserIdFromToken = () => {
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) {
            return storedUserId
        }

        const token = localStorage.getItem('token')
        if (!token) {
            return null
        }

        try {
            const [, payload] = token.split('.')
            if (!payload) {
                return null
            }

            const decodedPayload = JSON.parse(atob(payload))
            return decodedPayload.userId ?? null
        } catch {
            return null
        }
    }

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
                        ? `Settings saved! Estimated time to reach your goal: ${estimatedWeeksToGoal} weeks.`
                        : isOnboarding
                            ? 'Settings saved successfully! Redirecting...'
                            : 'Settings saved successfully!',
            })

            if (isOnboarding) {
                window.setTimeout(() => {
                    onSubmitSuccess?.()
                }, 1200)
            }
        } catch {
            setFeedback({ type: 'error', message: 'Unable to save your settings right now.' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
                {/* <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Settings</p> */}
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {isOnboarding ? 'Complete your profile' : 'Update your body metrics'}
                </h2>
                <p className="my-5 text-sm leading-6 text-slate-600">
                    {isOnboarding
                        ? 'Fill in your measurements and goals so Calorita can personalize your plan.'
                        : 'Add your current measurements and goals so Calorita can tailor your daily nutrition plan.'}
                </p>
                {lastUpdated ? (
                    <p className="mt-5 text-sm text-gray-500">Last updated: {lastUpdated}</p>
                ) : null}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="height">
                            Height (cm)
                        </label>
                        <input
                            id="height"
                            type="number"
                            min="1"
                            value={form.height}
                            onChange={handleChange('height')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="weight">
                            Weight (kg)
                        </label>
                        <input
                            id="weight"
                            type="number"
                            min="1"
                            value={form.weight}
                            onChange={handleChange('weight')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="dateOfBirth">
                            Date of Birth
                        </label>
                        <input
                            id="dateOfBirth"
                            type="date"
                            value={form.dateOfBirth}
                            onChange={handleChange('dateOfBirth')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="sex">
                            Sex
                        </label>
                        <select
                            id="sex"
                            value={form.sex}
                            onChange={handleChange('sex')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="activityLevel">
                            Activity Level
                        </label>
                        <select
                            id="activityLevel"
                            value={form.activityLevel}
                            onChange={handleChange('activityLevel')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        >
                            <option value="SEDENTARY">SEDENTARY</option>
                            <option value="LIGHT">LIGHT</option>
                            <option value="MODERATE">MODERATE</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="VERY_ACTIVE">VERY ACTIVE</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="goal">
                            Goal
                        </label>
                        <select
                            id="goal"
                            value={form.goal}
                            onChange={handleChange('goal')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        >
                            <option value="LOSE">LOSE</option>
                            <option value="MAINTAIN">MAINTAIN</option>
                            <option value="GAIN">GAIN</option>
                        </select>
                    </div>
                </div>

                {!isMaintainGoal ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="targetWeight">
                                Target Weight (kg)
                            </label>
                            <input
                                id="targetWeight"
                                type="number"
                                min="1"
                                value={form.targetWeight}
                                onChange={handleChange('targetWeight')}
                                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${targetWeightValidationError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-300'}`}
                                required={!isMaintainGoal}
                            />
                            {targetWeightValidationError ? (
                                <p className="mt-2 text-sm text-red-600">{targetWeightValidationError}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="pace">
                                Pace
                            </label>
                            <select
                                id="pace"
                                value={form.pace}
                                onChange={handleChange('pace')}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                required={!isMaintainGoal}
                            >
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                            </select>
                        </div>
                    </div>
                ) : null}

                {feedback ? (
                    <div className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-600 text-white' : 'border-red-200 bg-red-600 text-white'}`}>
                        {feedback.message}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSaving ? 'Saving...' : submitLabel}
                </button>
            </form>
        </div>
    )
}

export default UserSettingsForm
