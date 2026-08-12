import { useState, useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'
import { formatDateInput, parseDateInput } from '../utils/diary.utils'
import type { DiaryEntry, ProductOption, Summary } from '../types/diary.types'

export const useDiary = () => {
    const { t, i18n } = useTranslation()
    const isUkrainian = i18n.language?.startsWith('uk') ?? false

    const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()))
    const [entries, setEntries] = useState<DiaryEntry[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<ProductOption[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Формы и редактирование
    const [productId, setProductId] = useState('')
    const [weight, setWeight] = useState('')
    const [selectedServingDescription, setSelectedServingDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
    const [editingWeight, setEditingWeight] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)

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

    const per100gText = t('myDiary.per100g', 'Per 100g')
    const unitG = isUkrainian ? 'г' : 'g'
    const unitKcal = isUkrainian ? 'ккал' : 'kcal'
    const portionInputLabel = selectedServingDescription === per100gText
        ? t('myDiary.weight', 'Weight (g)')
        : t('myDiary.quantity', 'Quantity')

    // Поиск продуктов
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
                const response = await apiClient.get('/products/search', {
                    params: { q: searchQuery.trim(), lang: i18n.language },
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
    }, [searchQuery, i18n.language])

    // Загрузка записей дневника
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
        ? { calories: 0, protein: 0, fat: 0, carbs: 0 }
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

    const handleBackToToday = () => setSelectedDate(formatDateInput(new Date()))

    const handleSelectProduct = (product: ProductOption) => {
        setProductId(product.id)
        setSelectedProduct(product)
        setSearchQuery(product.name)

        const is100g = !product.pieceName && (product.description?.includes('Per 100g') ?? true)
        const servingText = is100g ? per100gText : (product.pieceName || product.description?.split(' - ')[0]?.trim() || '')

        setSelectedServingDescription(servingText)
        setWeight(is100g ? '' : '1')
        setSearchResults([])
        setIsDropdownOpen(false)
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

            setEntries((prev) => [response.data, ...prev])
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
        if (!editingWeight) return

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

    return {
        state: {
            selectedDate,
            entries,
            searchQuery,
            searchResults,
            isDropdownOpen,
            loading,
            error,
            submitting,
            editingEntryId,
            editingWeight,
            targetMacros,
            consumedMacros,
            unitG,
            unitKcal,
            portionInputLabel,
            weight,
        },
        actions: {
            setSearchQuery,
            setIsDropdownOpen,
            setWeight,
            setEditingWeight,
            changeDay,
            isSelectedDateToday,
            handleBackToToday,
            handleSelectProduct,
            handleSubmit,
            handleDelete,
            handleEditStart,
            handleEditSave,
            setSelectedDate,
        }
    }
}