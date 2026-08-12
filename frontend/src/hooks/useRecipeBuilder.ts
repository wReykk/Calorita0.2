import { useState, useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'
import { type RecipeDetails } from '../types/recipe.types'
import { recipeService } from '../services/recipe.service'
import type { ProductOption, Ingredient } from '../types/recipe.types'

type UseRecipeBuilderProps = {
    open: boolean
    onClose: () => void
    onSaveSuccess: () => void
    initialData?: RecipeDetails
}

export const useRecipeBuilder = ({ open, onClose, onSaveSuccess, initialData }: UseRecipeBuilderProps) => {
    const { t, i18n } = useTranslation()

    const [name, setName] = useState(() => initialData?.name ?? '')
    const [totalWeight, setTotalWeight] = useState(() => (initialData?.totalWeight != null ? String(initialData.totalWeight) : ''))
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<ProductOption[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [ingredients, setIngredients] = useState<Ingredient[]>(() => initialData?.recipeIngredients.map((item) => ({
        id: item.ingredientId,
        productId: item.ingredientId,
        name: item.ingredient?.name || t('recipeBuilder.unknownProduct', 'Unknown product'),
        calories: item.ingredient?.calories,
        protein: item.ingredient?.protein,
        fat: item.ingredient?.fat,
        carbs: item.ingredient?.carbs,
        pieceName: item.ingredient?.pieceName,
        amount: item.amount,
    })) ?? [])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const clearForm = () => {
        setName('')
        setTotalWeight('')
        setSearchQuery('')
        setSearchResults([])
        setIsDropdownOpen(false)
        setIngredients([])
        setError('')
    }

    useEffect(() => {
        if (!open || searchQuery.trim().length < 2) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            const fetchSearch = async () => {
                try {
                    const response = await apiClient.get('/products/search', {
                        params: { q: searchQuery.trim(), lang: i18n.language },
                    })

                    const results = Array.isArray(response.data) ? response.data : []
                    setSearchResults(
                        results.map((product: ProductOption) => ({
                            ...product,
                            id: product.id || product.externalId || '',
                        })),
                    )
                    setIsDropdownOpen(results.length > 0)
                } catch {
                    setSearchResults([])
                    setIsDropdownOpen(false)
                }
            }

            void fetchSearch()
        }, 400)

        return () => window.clearTimeout(timeoutId)
    }, [open, searchQuery, i18n.language])

    const handleSelectProduct = (product: ProductOption) => {
        if (!product.id) return

        setIngredients((prev) => {
            if (prev.some((item) => item.productId === product.id)) {
                return prev
            }

            return [
                ...prev,
                {
                    ...product,
                    productId: product.id,
                    amount: product.pieceName ? 1 : 100,
                },
            ]
        })

        setSearchQuery(product.name)
        setSearchResults([])
        setIsDropdownOpen(false)
    }

    const handleRemoveIngredient = (productId: string) => {
        setIngredients((prev) => prev.filter((item) => item.productId !== productId))
    }

    const handleAmountChange = (productId: string, value: string) => {
        const parsed = Number(value)
        if (Number.isNaN(parsed) || parsed < 0) return

        setIngredients((prev) => prev.map((item) => (
            item.productId === productId ? { ...item, amount: parsed } : item
        )))
    }

    const handleClose = () => {
        onClose()
        clearForm()
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!name.trim()) {
            setError(t('recipeBuilder.errorName', 'Please enter a recipe name.'))
            return
        }

        const parsedWeight = Number(totalWeight)
        if (!parsedWeight || parsedWeight <= 0) {
            setError(t('recipeBuilder.errorWeight', 'Please enter a valid cooked weight.'))
            return
        }

        if (ingredients.length === 0) {
            setError(t('recipeBuilder.errorIngredients', 'Add at least one ingredient.'))
            return
        }

        setLoading(true)

        try {
            const payload = {
                name: name.trim(),
                totalWeight: parsedWeight,
                ingredients: ingredients.map(ing => ({
                    productId: String(ing.id),
                    amount: ing.amount,
                    name: ing.name,
                    calories: ing.calories,
                    protein: ing.protein,
                    fat: ing.fat,
                    carbs: ing.carbs,
                    pieceName: ing.pieceName
                }))
            }

            if (initialData?.id) {
                await recipeService.updateRecipe(initialData.id, payload)
            } else {
                await recipeService.createRecipe(payload)
            }

            onSaveSuccess()
            handleClose()
        } catch {
            setError(t('recipeBuilder.errorSave', 'Could not save recipe. Please try again.'))
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!initialData?.id) return

        if (window.confirm(t('recipeBuilder.confirmDelete', 'Are you sure you want to delete this recipe?'))) {
            try {
                await recipeService.deleteRecipe(initialData.id)
                onSaveSuccess()
                onClose()
            } catch (err) {
                console.error('Failed to delete recipe', err)
            }
        }
    }

    return {
        state: {
            name,
            totalWeight,
            searchQuery,
            searchResults,
            isDropdownOpen,
            ingredients,
            loading,
            error
        },
        actions: {
            setName,
            setTotalWeight,
            setSearchQuery,
            setSearchResults,
            setIsDropdownOpen,
            handleSelectProduct,
            handleRemoveIngredient,
            handleAmountChange,
            handleClose,
            handleSubmit,
            handleDelete
        }
    }
}