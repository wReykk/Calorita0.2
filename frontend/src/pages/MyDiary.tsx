import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'
import DailyProgress from '../components/DailyProgress'

type DiaryEntry = {
    id: string
    amount: number
    date?: string
    product?: {
        name: string
        calories?: number | null
        protein?: number | null
        fat?: number | null
        carbs?: number | null
    }
}

type ProductOption = {
    id: string
    name: string
}

type Summary = {
    totalCalories: number
    totalProtein: number
    totalFat: number
    totalCarbs: number
}

function formatDateInput(date: Date) {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}

function parseDateInput(value: string) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

function getConsumedNutrition(entry: DiaryEntry) {
    const multiplier = (entry.amount || 0) / 100
    const product = entry.product

    return {
        calories: Math.round((product?.calories || 0) * multiplier),
        protein: Number((product?.protein || 0) * multiplier).toFixed(1),
        fat: Number((product?.fat || 0) * multiplier).toFixed(1),
        carbs: Number((product?.carbs || 0) * multiplier).toFixed(1),
    }
}

function MyDiary() {
    const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()))
    const [entries, setEntries] = useState<DiaryEntry[]>([])
    const [products, setProducts] = useState<ProductOption[]>([])
    const [targetMacros] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser)
                return {
                    dailyCalories: Number(parsedUser.dailyCalories ?? 0),
                    dailyProtein: Number(parsedUser.dailyProtein ?? 0),
                    dailyFat: Number(parsedUser.dailyFat ?? 0),
                    dailyCarbs: Number(parsedUser.dailyCarbs ?? 0),
                }
            }
        } catch {
            console.error("Error parsing user data from localStorage")
        }

        return { dailyCalories: 0, dailyProtein: 0, dailyFat: 0, dailyCarbs: 0 }
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [productId, setProductId] = useState('')
    const [weight, setWeight] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
    const [editingWeight, setEditingWeight] = useState('')
    const { t, i18n } = useTranslation()
    const isUkrainian = i18n.language?.startsWith('uk') ?? false
    const unitG = isUkrainian ? 'г' : 'g'
    const unitKcal = isUkrainian ? 'ккал' : 'kcal'

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiClient.get('/products')
                const productList = Array.isArray(response.data) ? response.data : []
                setProducts(productList)
                if (productList[0]) {
                    setProductId(productList[0].id)
                }
            } catch {
                setError(t('myDiary.errorLoadProducts'))
            }
        }

        fetchProducts()
    }, [])

    useEffect(() => {
        const fetchEntries = async () => {
            setLoading(true)
            setError('')

            try {
                const response = await apiClient.get('/diary')

                const allEntries = Array.isArray(response.data) ? response.data : []
                const filteredEntries = allEntries.filter((entry: DiaryEntry) => {
                    const entryDate = entry.date ? entry.date.split('T')[0] : ''
                    return entryDate === selectedDate
                })

                setEntries(filteredEntries)
            } catch {
                setError(t('myDiary.errorLoadEntries'))
            } finally {
                setLoading(false)
            }
        }

        fetchEntries()
    }, [selectedDate])

    const summary = entries.reduce<Summary>(
        (acc, entry) => {
            const multiplier = (entry.amount || 0) / 100
            const product = entry.product

            acc.totalCalories += (product?.calories || 0) * multiplier
            acc.totalProtein += (product?.protein || 0) * multiplier
            acc.totalFat += (product?.fat || 0) * multiplier
            acc.totalCarbs += (product?.carbs || 0) * multiplier

            return acc
        },
        { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
    )

    const consumedMacros = loading || entries.length === 0
        ? {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
        }
        : {
            calories: summary.totalCalories,
            protein: summary.totalProtein,
            fat: summary.totalFat,
            carbs: summary.totalCarbs,
        }

    const changeDay = (delta: number) => {
        const nextDate = parseDateInput(selectedDate)
        nextDate.setDate(nextDate.getDate() + delta)
        setSelectedDate(formatDateInput(nextDate))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!productId || !weight) {
            setError(t('myDiary.errorMissingSelection'))
            return
        }

        setSubmitting(true)

        try {
            const response = await apiClient.post('/diary', {
                productId,
                amount: Number(weight),
                date: new Date(`${selectedDate}T12:00:00`).toISOString(),
            })

            const newEntry = response.data
            setEntries((prev) => [newEntry, ...prev])
            setWeight('')
        } catch {
            setError(t('myDiary.errorAddEntry'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (entryId: string) => {
        try {
            await apiClient.delete(`/diary/${entryId}`)
            setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
        } catch {
            setError(t('myDiary.errorDeleteEntry'))
        }
    }

    const handleEditStart = (entry: DiaryEntry) => {
        setEditingEntryId(entry.id)
        setEditingWeight(String(entry.amount))
    }

    const handleEditSave = async (entryId: string) => {
        if (!editingWeight) {
            return
        }

        try {
            const response = await apiClient.put(`/diary/${entryId}`, {
                amount: Number(editingWeight),
            })

            setEntries((prev) => prev.map((entry) => (entry.id === entryId ? { ...entry, ...response.data } : entry)))
            setEditingEntryId(null)
            setEditingWeight('')
        } catch {
            setError(t('myDiary.errorUpdateEntry'))
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{t('myDiary.title')}</h1>
                        <p className="text-sm text-gray-600">{t('myDiary.subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => changeDay(-1)}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            {t('myDiary.previousDay')}
                        </button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(event) => setSelectedDate(event.target.value)}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-slate-500"
                        />
                        <button
                            type="button"
                            onClick={() => changeDay(1)}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            {t('myDiary.nextDay')}
                        </button>
                    </div>
                </div>
            </div>



            <div className="grid gap-6">
                <div className="space-y-4">
                    <DailyProgress targetMacros={targetMacros} consumedMacros={consumedMacros} />

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">{t('myDiary.logEntryTitle')}</h2>
                        <p className="mt-1 text-sm text-gray-600">{t('myDiary.logEntrySubtitle')}</p>

                        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-[1.4fr_0.8fr_auto] md:items-end">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('myDiary.product')}</label>
                                <select
                                    value={productId}
                                    onChange={(event) => setProductId(event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                    required
                                >
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('myDiary.weight')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={weight}
                                    onChange={(event) => setWeight(event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {submitting ? t('myDiary.saving') : t('myDiary.save')}
                            </button>
                        </form>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">{t('myDiary.consumedProducts')}</h2>
                            <span className="text-sm text-gray-500">{selectedDate}</span>
                        </div>

                        {loading ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-gray-600">
                                {t('myDiary.loading')}
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-gray-600">
                                {t('myDiary.empty')}
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {entries.map((entry) => {
                                    const nutrition = getConsumedNutrition(entry)

                                    return (
                                        <li key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="break-words font-medium text-gray-900">{entry.product?.name || t('myDiary.unnamedProduct')}</p>
                                                        <p className="mt-1 text-sm text-gray-600">{t('myDiary.consumedLabel', { amount: entry.amount })}</p>
                                                    </div>

                                                    {editingEntryId === entry.id ? (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={editingWeight}
                                                                onChange={(event) => setEditingWeight(event.target.value)}
                                                                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditSave(entry.id)}
                                                                className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white transition hover:bg-slate-700"
                                                            >
                                                                {t('myDiary.saveChanges')}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditStart(entry)}
                                                                className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                {t('myDiary.edit')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(entry.id)}
                                                                className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                            >
                                                                {t('myDiary.delete')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                                    <div className="min-w-[110px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('myDiary.calories')}</p>
                                                        <p className="mt-1 font-semibold text-slate-900">{nutrition.calories} {unitKcal}</p>
                                                    </div>
                                                    <div className="min-w-[110px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('myDiary.protein')}</p>
                                                        <p className="mt-1 font-semibold text-slate-900">{nutrition.protein} {unitG}</p>
                                                    </div>
                                                    <div className="min-w-[110px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('myDiary.fat')}</p>
                                                        <p className="mt-1 font-semibold text-slate-900">{nutrition.fat} {unitG}</p>
                                                    </div>
                                                    <div className="min-w-[110px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('myDiary.carbs')}</p>
                                                        <p className="mt-1 font-semibold text-slate-900">{nutrition.carbs} {unitG}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
                    <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>{t('myDiary.dailySummary')}</h2>
                    <p className="mt-2 text-sm text-slate-300 " >{t('myDiary.dailySummarySubtitle')}</p>

                    <div className="mt-6 grid gap-3">
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">{t('myDiary.calories')}</p>
                            <p className="text-2xl font-semibold">{t('myDiary.kcalLabel', { amount: summary.totalCalories.toFixed(0) })}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">{t('myDiary.protein')}</p>
                            <p className="text-2xl font-semibold">{t('myDiary.proteinValue', { amount: summary.totalProtein.toFixed(1) })}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">{t('myDiary.fat')}</p>
                            <p className="text-2xl font-semibold">{t('myDiary.fatValue', { amount: summary.totalFat.toFixed(1) })}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">{t('myDiary.carbs')}</p>
                            <p className="text-2xl font-semibold">{t('myDiary.carbsValue', { amount: summary.totalCarbs.toFixed(1) })}</p>
                        </div>
                    </div>
                </div> */}
            </div>

        </div>
    )
}

export default MyDiary
