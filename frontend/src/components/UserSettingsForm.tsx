import { useState, type ChangeEvent, type FormEvent } from 'react'
import apiClient from '../assets/api/client'

type FormState = {
    height: string
    weight: string
    dateOfBirth: string
    sex: 'MALE' | 'FEMALE'
    activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE'
    goal: 'LOSE' | 'MAINTAIN' | 'GAIN'
}

const initialFormState: FormState = {
    height: '',
    weight: '',
    dateOfBirth: '',
    sex: 'MALE',
    activityLevel: 'MODERATE',
    goal: 'MAINTAIN',
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

const getInitialFormState = (): FormState => {
    const storedUser = getStoredUser()

    if (!storedUser) {
        return initialFormState
    }

    return {
        height: storedUser.height?.toString() ?? '',
        weight: storedUser.weight?.toString() ?? '',
        dateOfBirth: formatDateForInput(storedUser.dateOfBirth),
        sex: storedUser.sex === 'FEMALE' ? 'FEMALE' : 'MALE',
        activityLevel: ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'].includes(storedUser.activityLevel)
            ? storedUser.activityLevel
            : 'MODERATE',
        goal: ['LOSE', 'MAINTAIN', 'GAIN'].includes(storedUser.goal)
            ? storedUser.goal
            : 'MAINTAIN',
    }
}

function UserSettingsForm() {
    const [form, setForm] = useState<FormState>(() => getInitialFormState())
    const [isSaving, setIsSaving] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
        const storedUser = getStoredUser()
        return storedUser?.updatedAt ? formatDisplayDate(storedUser.updatedAt) : null
    })

    const handleChange = (field: keyof FormState) => (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setForm((current) => ({ ...current, [field]: event.target.value as FormState[keyof FormState] }))
    }

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
            }

            const response = await apiClient.patch(`/users/${userId}/parameters`, payload)
            const updatedUser = response.data?.user

            if (updatedUser) {
                localStorage.setItem('user', JSON.stringify(updatedUser))
                setLastUpdated(formatDisplayDate(updatedUser.updatedAt))
            }

            setFeedback('Your settings have been saved successfully.')
        } catch {
            setFeedback('Unable to save your settings right now.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Settings</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Update your body metrics</h2>
                <p className="my-5 text-sm leading-6 text-slate-600">
                    Add your current measurements and goals so Calorita can tailor your daily nutrition plan.
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

                {feedback ? (
                    <div className={`rounded-lg border px-4 py-3 text-sm ${feedback.includes('successfully') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
                        {feedback}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSaving ? 'Saving...' : 'Save settings'}
                </button>
            </form>
        </div>
    )
}

export default UserSettingsForm
