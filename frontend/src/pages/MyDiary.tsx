import { useEffect, useState, type FormEvent } from 'react'
import apiClient from '../assets/api/client'

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

function MyDiary() {
    const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()))
    const [entries, setEntries] = useState<DiaryEntry[]>([])
    const [products, setProducts] = useState<ProductOption[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [productId, setProductId] = useState('')
    const [weight, setWeight] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
    const [editingWeight, setEditingWeight] = useState('')

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
                setError('Failed to load available products.')
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
                setError('Failed to load your diary entries.')
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

    const changeDay = (delta: number) => {
        const nextDate = parseDateInput(selectedDate)
        nextDate.setDate(nextDate.getDate() + delta)
        setSelectedDate(formatDateInput(nextDate))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!productId || !weight) {
            setError('Please select a product and enter a valid weight.')
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
            setError('Failed to add the food entry.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (entryId: string) => {
        try {
            await apiClient.delete(`/diary/${entryId}`)
            setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
        } catch {
            setError('Failed to delete the diary entry.')
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
            setError('Failed to update the diary entry.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">My Diary</h1>
                        <p className="text-sm text-gray-600">Track what you ate and review your daily totals.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => changeDay(-1)}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Previous Day
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
                            Next Day
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Log a food entry</h2>
                <p className="mt-1 text-sm text-gray-600">Choose a product and enter the portion size in grams.</p>

                <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-[1.4fr_0.8fr_auto] md:items-end">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Product</label>
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
                        <label className="mb-1 block text-sm font-medium text-gray-700">Weight (g)</label>
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
                        {submitting ? 'Saving...' : 'Add entry'}
                    </button>
                </form>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Consumed products</h2>
                        <span className="text-sm text-gray-500">{selectedDate}</span>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-gray-600">
                            Loading your diary...
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-gray-600">
                            No entries recorded for this day yet.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {entries.map((entry) => (
                                <li key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{entry.product?.name || 'Unnamed product'}</p>
                                        <p className="text-sm text-gray-600">{entry.amount}g consumed</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-right text-sm text-gray-600">
                                        <div>
                                            <p>{Math.round((entry.product?.calories || 0) * (entry.amount / 100))} kcal</p>
                                            <p>{entry.product?.protein || 0}g protein</p>
                                        </div>
                                        {editingEntryId === entry.id ? (
                                            <div className="flex items-center gap-2">
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
                                                    Save
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditStart(entry)}
                                                    className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
                    <h2 className="text-lg font-semibold">Daily summary</h2>
                    <p className="mt-2 text-sm text-slate-300">Your nutrition totals for this day.</p>

                    <div className="mt-6 grid gap-3">
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">Calories</p>
                            <p className="text-2xl font-semibold">{summary.totalCalories.toFixed(0)} kcal</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">Protein</p>
                            <p className="text-2xl font-semibold">{summary.totalProtein.toFixed(1)} g</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">Fat</p>
                            <p className="text-2xl font-semibold">{summary.totalFat.toFixed(1)} g</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                            <p className="text-sm text-slate-300">Carbs</p>
                            <p className="text-2xl font-semibold">{summary.totalCarbs.toFixed(1)} g</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyDiary
