import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { recipeService } from '../services/recipe.service'
import { type Recipe, type RecipeDetails } from '../types/recipe.types'
import type { Product, ProductFormState, EditState } from '../types/collection.types'
import { productService } from '../services/product.service'

export const emptyForm: ProductFormState = {
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
}

export const useCollection = () => {
    const { t } = useTranslation()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState<ProductFormState>(emptyForm)
    const [pieceName, setPieceName] = useState('')
    const [editState, setEditState] = useState<EditState>({ productId: null, values: emptyForm })

    const [activeTab, setActiveTab] = useState<'products' | 'recipes'>('products')
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [recipesLoading, setRecipesLoading] = useState(false)
    const [recipesError, setRecipesError] = useState('')
    const [isRecipeBuilderOpen, setIsRecipeBuilderOpen] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<RecipeDetails | null>(null)
    const [recipeBuilderError, setRecipeBuilderError] = useState('')

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getProducts()
                setProducts(data || [])
            } catch {
                setError(t('products.errorLoad'))
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [t])

    const fetchRecipes = useCallback(async () => {
        setRecipesLoading(true)
        setRecipesError('')

        try {
            const data = await recipeService.getRecipes()
            setRecipes(data)
        } catch {
            setRecipesError(t('products.errorLoadRecipes', 'Failed to load recipes'))
        } finally {
            setRecipesLoading(false)
        }
    }, [t])

    useEffect(() => {
        if (activeTab !== 'recipes') return

        const loadRecipes = async () => {
            await fetchRecipes()
        }

        void loadRecipes()
    }, [activeTab, fetchRecipes])

    const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        try {
            const normalizedPieceName = pieceName.trim() || undefined
            const payload = {
                name: form.name,
                calories: Number(form.calories),
                protein: Number(form.protein),
                fat: Number(form.fat),
                carbs: Number(form.carbs),
                pieceName: normalizedPieceName,
            }

            const data = await productService.createProduct(payload)
            setProducts((prev) => [data, ...prev])
            setForm(emptyForm)
            setPieceName('')
        } catch {
            setError(t('products.errorCreate'))
        }
    }

    const handleDeleteProduct = async (productId: number) => {
        try {
            await productService.deleteProduct(productId)
            setProducts((prev) => prev.filter((product) => product.id !== productId))
        } catch {
            setError(t('products.errorDelete'))
        }
    }

    const startEditProduct = (product: Product) => {
        setEditState({
            productId: product.id,
            values: {
                name: product.name,
                calories: String(product.calories ?? ''),
                protein: String(product.protein ?? ''),
                fat: String(product.fat ?? ''),
                carbs: String(product.carbs ?? ''),
            },
        })
    }

    const handleEditProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!editState.productId) return

        try {
            const payload = {
                name: editState.values.name,
                calories: Number(editState.values.calories),
                protein: Number(editState.values.protein),
                fat: Number(editState.values.fat),
                carbs: Number(editState.values.carbs),
            }

            const data = await productService.updateProduct(editState.productId, payload)
            setProducts((prev) => prev.map((product) => (product.id === editState.productId ? data : product)))
            setEditState({ productId: null, values: emptyForm })
        } catch {
            setError(t('products.errorUpdate'))
        }
    }

    const handleCreateRecipe = () => {
        setEditingRecipe(null)
        setRecipeBuilderError('')
        setIsRecipeBuilderOpen(true)
    }

    const handleEditRecipe = async (recipeId: string) => {
        setRecipeBuilderError('')

        try {
            const recipeData = await recipeService.getRecipe(recipeId)
            setEditingRecipe(recipeData)
            setIsRecipeBuilderOpen(true)
        } catch {
            setRecipeBuilderError(t('products.errorLoadRecipe', 'Failed to load recipe details'))
        }
    }

    const handleRecipeBuilderClose = () => {
        setIsRecipeBuilderOpen(false)
        setEditingRecipe(null)
        setRecipeBuilderError('')
    }

    return {
        state: {
            products,
            loading,
            error,
            form,
            pieceName,
            editState,
            activeTab,
            recipes,
            recipesLoading,
            recipesError,
            isRecipeBuilderOpen,
            editingRecipe,
            recipeBuilderError
        },
        actions: {
            setForm,
            setPieceName,
            setEditState,
            setActiveTab,
            handleProductSubmit,
            handleDeleteProduct,
            startEditProduct,
            handleEditProductSubmit,
            handleCreateRecipe,
            handleEditRecipe,
            handleRecipeBuilderClose,
            fetchRecipes
        }
    }
}