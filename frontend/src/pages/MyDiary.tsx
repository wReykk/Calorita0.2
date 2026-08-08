import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'
import DailyProgress from '../components/DailyProgress'
import { usePageTitle } from '../hooks/usePageTitle.js'
import WaterTracker from '../components/WaterTracker.js'


type DiaryEntry = {
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

type ProductOption = {
    id: string
    name: string
    calories?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
    externalId?: string
    servingDescription?: string | null
    description?: string
    isGlobal?: boolean,
    pieceName?: string | null
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
    const multiplier = entry.pieceName ? (entry.amount || 0) : (entry.amount || 0) / 100

    return {
        calories: Math.round((entry.calories || 0) * multiplier),
        protein: Number((entry.protein || 0) * multiplier).toFixed(1),
        fat: Number((entry.fat || 0) * multiplier).toFixed(1),
        carbs: Number((entry.carbs || 0) * multiplier).toFixed(1),
    }
}

function MyDiary() {
    const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()))
    const [entries, setEntries] = useState<DiaryEntry[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<ProductOption[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    const [selectedServingDescription, setSelectedServingDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
    const [editingWeight, setEditingWeight] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)
    const { t, i18n } = useTranslation()
    const isUkrainian = i18n.language?.startsWith('uk') ?? false
    const unitG = isUkrainian ? 'г' : 'g'
    const unitKcal = isUkrainian ? 'ккал' : 'kcal'
    usePageTitle(t('myDiary.pageTitle', 'Diary'))

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setTimeout(() => {
                setSearchResults([])
                setIsDropdownOpen(false)
            }, 0)
            return
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await apiClient.get('/products/search', {
                    params: { q: searchQuery.trim() },
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                })

                const results = Array.isArray(response.data) ? response.data : []
                setSearchResults(results.map((product: ProductOption) => ({
                    ...product,
                    id: product.id || product.externalId || '',
                })))
                setIsDropdownOpen(results.length > 0)
            } catch {
                setSearchResults([])
                setIsDropdownOpen(false)
            }
        }, 500)

        return () => window.clearTimeout(timeoutId)
    }, [searchQuery])

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
    }, [selectedDate, t])

    const summary = entries.reduce<Summary>(
        (acc, entry) => {
            const multiplier = entry.pieceName ? (entry.amount || 0) : (entry.amount || 0) / 100

            acc.totalCalories += (entry.calories || 0) * multiplier
            acc.totalProtein += (entry.protein || 0) * multiplier
            acc.totalFat += (entry.fat || 0) * multiplier
            acc.totalCarbs += (entry.carbs || 0) * multiplier

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

    const isSelectedDateToday = () => {
        const today = new Date()
        const selected = parseDateInput(selectedDate)

        return (
            selected.getFullYear() === today.getFullYear() &&
            selected.getMonth() === today.getMonth() &&
            selected.getDate() === today.getDate()
        )
    }

    const handleBackToToday = () => {
        setSelectedDate(formatDateInput(new Date()))
    }

    const handleSelectProduct = (product: ProductOption) => {
        setProductId(product.id)
        setSelectedProduct(product)
        setSearchQuery(product.name)

        const is100g = !product.pieceName && (product.description?.includes('Per 100g') ?? true)
        const servingText = is100g ? 'Per 100g' : (product.pieceName || product.description?.split(' - ')[0]?.trim() || '')

        setSelectedServingDescription(servingText)
        setWeight(is100g ? '' : '1')

        setSearchResults([])
        setIsDropdownOpen(false)
    }

    const portionInputLabel = selectedServingDescription === 'Per 100g' ? 'Weight (g)' : 'Quantity'

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
                productData: selectedProduct?.externalId ? {
                    name: selectedProduct.name,
                    calories: selectedProduct.calories ?? 0,
                    protein: selectedProduct.protein ?? 0,
                    fat: selectedProduct.fat ?? 0,
                    carbs: selectedProduct.carbs ?? 0,
                    externalId: selectedProduct.externalId,
                    isGlobal: true,
                    pieceName: selectedProduct.pieceName || undefined
                } : undefined
            })

            const newEntry = response.data
            setEntries((prev) => [newEntry, ...prev])

            setWeight('')
            setSearchQuery('')
            setProductId('')
            setSelectedProduct(null)

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

                    <div className="flex flex-wrap items-center gap-3">
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
                        {!isSelectedDateToday() ? (
                            <button
                                type="button"
                                onClick={handleBackToToday}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                            >
                                Back to Today
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>



            <div className="grid gap-6">
                <div className="space-y-4">
                    {/* Убрали items-start, теперь колонки снова равны по высоте! */}
                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                        <div className="min-w-0 lg:col-span-2">
                            <DailyProgress targetMacros={targetMacros} consumedMacros={consumedMacros} />
                        </div>

                        <div className="min-w-0 lg:col-span-1">
                            {/* WaterTracker сам растянется благодаря h-full внутри него */}
                            <WaterTracker selectedDate={selectedDate} />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">{t('myDiary.logEntryTitle')}</h2>
                        <p className="mt-1 text-sm text-gray-600">{t('myDiary.logEntrySubtitle')}</p>

                        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-[1.4fr_0.8fr_auto] md:items-end">
                            <div className="relative">
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('myDiary.product')}</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => {
                                        setSearchQuery(event.target.value)
                                        setProductId('')
                                        setSelectedProduct(null)
                                        setSearchResults([])
                                        setIsDropdownOpen(event.target.value.trim().length >= 2)
                                    }}
                                    onFocus={() => {
                                        if (searchQuery.trim().length >= 2) {
                                            setIsDropdownOpen(true)
                                        }
                                    }}
                                    placeholder={t('myDiary.productSearchPlaceholder', 'Search products')}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                    required
                                />

                                {isDropdownOpen && searchResults.length > 0 ? (
                                    <ul className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                        {(() => {
                                            const myProducts = searchResults.filter((product) => product.isGlobal === false)
                                            const globalProducts = searchResults.filter((product) => product.isGlobal === true)
                                            const sections = [
                                                { title: 'My Products', items: myProducts },
                                                { title: 'Global Database', items: globalProducts },
                                            ]

                                            return sections.flatMap((section, sectionIndex) => {
                                                if (section.items.length === 0) {
                                                    return []
                                                }

                                                return [
                                                    <li key={`${section.title}-header`} className="border-b border-slate-100 bg-slate-50 px-3 py-2">
                                                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                            {section.title}
                                                        </span>
                                                    </li>,
                                                    ...section.items.map((product) => (
                                                        <li key={product.id}>
                                                            <button
                                                                type="button"
                                                                onMouseDown={(event) => {
                                                                    event.preventDefault()
                                                                    handleSelectProduct(product)
                                                                }}
                                                                className="flex w-full flex-col items-start px-3 py-2 text-left transition hover:bg-slate-50"
                                                            >
                                                                <span className="text-sm font-medium text-slate-900">{product.name}</span>

                                                                {product.description ? (
                                                                    <span className="mt-1 text-xs font-medium text-emerald-600">
                                                                        {product.description.includes('Per 100g')
                                                                            ? 'Per 100g'
                                                                            : product.description.split(' - ')[0]?.trim()}
                                                                    </span>
                                                                ) : null}
                                                                <span className="mt-1 text-xs text-slate-500">
                                                                    {Math.round(product.calories ?? 0)} kcal • {product.protein ?? 0}g P • {product.fat ?? 0}g F • {product.carbs ?? 0}g C
                                                                </span>
                                                            </button>
                                                        </li>
                                                    )),
                                                    sectionIndex < sections.length - 1 && section.items.length > 0 ? (
                                                        <li key={`${section.title}-divider`} className="border-t border-slate-100" />
                                                    ) : null,
                                                ]
                                            })
                                        })()}
                                    </ul>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{portionInputLabel}</label>
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
                                                        <p className="wrap-break-word font-medium text-gray-900">{entry.name || t('myDiary.unnamedProduct')}</p>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {entry.pieceName
                                                                ? `${entry.amount} x ${entry.pieceName.replace('Per ', '')}`
                                                                : t('myDiary.consumedLabel', { amount: entry.amount })}
                                                        </p>
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
                                                    <div className="min-w-27.5 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('myDiary.calories')}</p>
                                                        <p className="mt-1 font-semibold text-slate-900">{nutrition.calories} {unitKcal}</p>
                                                    </div>
                                                    <div className="min-w-27.5 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('myDiary.protein')}</p>
                                                        <p className="mt-1 font-semibold text-slate-900">{nutrition.protein} {unitG}</p>
                                                    </div>
                                                    <div className="min-w-27.5 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('myDiary.fat')}</p>
                                                        <p className="mt-1 font-semibold text-slate-900">{nutrition.fat} {unitG}</p>
                                                    </div>
                                                    <div className="min-w-27.5 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
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
