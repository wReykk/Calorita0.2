import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'
import RecipeBuilder from '../components/RecipeBuilder'
import { recipeService, type Recipe, type RecipeDetails } from '../services/recipe.service'
import { usePageTitle } from '../hooks/usePageTitle' // убрал .js, в TS обычно без расширения

type Product = {
    id: number
    name: string
    calories?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
    description?: string | null
}

type ProductFormState = {
    name: string
    calories: string
    protein: string
    fat: string
    carbs: string
}

type EditState = {
    productId: number | null
    values: ProductFormState
}

const emptyForm = {
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
}

function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState<ProductFormState>(emptyForm)
    const [pieceName, setPieceName] = useState('')
    const [editState, setEditState] = useState<EditState>({ productId: null, values: emptyForm })

    // Состояния для рецептов
    const [activeTab, setActiveTab] = useState<'products' | 'recipes'>('products')
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [recipesLoading, setRecipesLoading] = useState(false)
    const [recipesError, setRecipesError] = useState('')
    const [isRecipeBuilderOpen, setIsRecipeBuilderOpen] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<RecipeDetails | null>(null)
    const [recipeBuilderError, setRecipeBuilderError] = useState('')

    const { t } = useTranslation()
    usePageTitle(t('home.pageTitle', 'My Collection'))

    // Загрузка продуктов
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiClient.get('/products')
                setProducts(response.data || [])
            } catch {
                setError(t('products.errorLoad'))
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [t])

    // Загрузка рецептов при переключении вкладки
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

            const response = await apiClient.post('/products', payload)
            setProducts((prev) => [response.data, ...prev])
            setForm(emptyForm)
            setPieceName('')
        } catch {
            setError(t('products.errorCreate'))
        }
    }

    const handleDelete = async (productId: number) => {
        try {
            await apiClient.delete(`/products/${productId}`)
            setProducts((prev) => prev.filter((product) => product.id !== productId))
        } catch {
            setError(t('products.errorDelete'))
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

    const startEdit = (product: Product) => {
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

    const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

            const response = await apiClient.put(`/products/${editState.productId}`, payload)
            setProducts((prev) => prev.map((product) => (product.id === editState.productId ? response.data : product)))
            setEditState({ productId: null, values: emptyForm })
        } catch {
            setError(t('products.errorUpdate'))
        }
    }

    return (
        <>
            <div className="space-y-6">
                {/* HEADER AND TABS */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('products.title')}</h1>
                        <p className="text-sm text-slate-600">{t('products.subtitle')}</p>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500 mt-5 mb-2">{t('products.tipValue')}</h3>
                        <p className="text-sm text-slate-600 mb-3">{t('products.tip')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('products')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === 'products' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            {t('products.myProducts', 'My Products')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('recipes')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === 'recipes' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            {t('products.myRecipes', 'My Recipes')}
                        </button>
                    </div>
                </div>

                {/* TAB CONTENT */}
                {activeTab === 'recipes' ? (
                    // RECIPES TAB
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">{t('products.recipesTitle', 'My Recipes')}</h2>
                                <p className="text-sm text-slate-600">{t('products.recipesSubtitle', 'View and manage your saved recipes.')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCreateRecipe}
                                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                            >
                                {t('products.createRecipe', 'Create Recipe')}
                            </button>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            {recipeBuilderError ? (
                                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {recipeBuilderError}
                                </div>
                            ) : null}

                            {recipesLoading ? (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-gray-600">
                                    {t('products.loading')}
                                </div>
                            ) : recipesError ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {recipesError}
                                </div>
                            ) : recipes.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-gray-600">
                                    {t('products.recipesEmpty', 'No recipes yet.')}
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {recipes.map((recipe: Recipe) => (
                                        <article key={recipe.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                            <div className="h-20 bg-slate-100 flex items-center justify-center">
                                                <span className="text-2xl">🍲</span>
                                            </div>
                                            <div className="space-y-3 p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="text-lg font-semibold text-slate-900">{recipe.name}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            void handleEditRecipe(recipe.id)
                                                        }}
                                                        className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        {t('products.edit')}
                                                    </button>
                                                </div>

                                                {/* Вывод макросов для рецепта на 100г */}
                                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mt-2">
                                                    <div className="rounded-lg bg-slate-50 p-2">
                                                        <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.calories')}</p>
                                                        <p className="font-medium text-slate-900">{t('products.kcalLabel', { amount: recipe.calories ?? 0 })}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-slate-50 p-2">
                                                        <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.protein')}</p>
                                                        <p className="font-medium text-slate-900">{t('products.proteinValue', { amount: recipe.protein ?? 0 })}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-slate-50 p-2">
                                                        <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.fat')}</p>
                                                        <p className="font-medium text-slate-900">{t('products.fatValue', { amount: recipe.fat ?? 0 })}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-slate-50 p-2">
                                                        <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.carbs')}</p>
                                                        <p className="font-medium text-slate-900">{t('products.carbsValue', { amount: recipe.carbs ?? 0 })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // PRODUCTS TAB
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('products.name')}</label>
                                    <input
                                        value={form.name}
                                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('products.calories')}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.calories}
                                        onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('products.protein')}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.protein}
                                        onChange={(event) => setForm((prev) => ({ ...prev, protein: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('products.fat')}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.fat}
                                        onChange={(event) => setForm((prev) => ({ ...prev, fat: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">{t('products.carbs')}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.carbs}
                                        onChange={(event) => setForm((prev) => ({ ...prev, carbs: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-4 max-w-xl">
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    {t('products.portionTypeLabel', 'Portion type (optional)')}
                                </label>
                                <input
                                    value={pieceName}
                                    onChange={(event) => setPieceName(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                                    placeholder={t('products.portionTypePlaceholder', 'e.g. 1 bar, 1 serving')}
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    {t('products.portionTypeHelp', 'Leave blank if macros are per 100g.')}
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
                            >
                                {t('products.addProduct')}
                            </button>
                        </form>

                        {error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        {loading ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                                {t('products.loading')}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                                {t('products.empty')}
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {products.map((product) => (
                                    <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <div className="h-40 bg-slate-100" />
                                        <div className="space-y-3 p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(product)}
                                                        className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        {t('products.edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        {t('products.delete')}
                                                    </button>
                                                </div>
                                            </div>

                                            {editState.productId === product.id ? (
                                                <form onSubmit={handleEditSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                    <div className="grid gap-2">
                                                        <input
                                                            value={editState.values.name}
                                                            onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, name: event.target.value } }))}
                                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                            required
                                                        />
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editState.values.calories}
                                                                onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, calories: event.target.value } }))}
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                                placeholder={t('products.placeholderCalories')}
                                                                required
                                                            />
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.1"
                                                                value={editState.values.protein}
                                                                onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, protein: event.target.value } }))}
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                                placeholder={t('products.placeholderProtein')}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.1"
                                                                value={editState.values.fat}
                                                                onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, fat: event.target.value } }))}
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                                placeholder={t('products.placeholderFat')}
                                                                required
                                                            />
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.1"
                                                                value={editState.values.carbs}
                                                                onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, carbs: event.target.value } }))}
                                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                                placeholder={t('products.placeholderCarbs')}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                                        >
                                                            {t('products.save')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditState({ productId: null, values: emptyForm })}
                                                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            {t('products.cancel')}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : null}

                                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                                <div className="rounded-lg bg-slate-50 p-2">
                                                    <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.calories')}</p>
                                                    <p className="font-medium text-slate-900">{t('products.kcalLabel', { amount: product.calories ?? 0 })}</p>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 p-2">
                                                    <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.protein')}</p>
                                                    <p className="font-medium text-slate-900">{t('products.proteinValue', { amount: product.protein ?? 0 })}</p>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 p-2">
                                                    <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.fat')}</p>
                                                    <p className="font-medium text-slate-900">{t('products.fatValue', { amount: product.fat ?? 0 })}</p>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 p-2">
                                                    <p className="text-xs uppercase tracking-wide text-slate-400">{t('products.carbs')}</p>
                                                    <p className="font-medium text-slate-900">{t('products.carbsValue', { amount: product.carbs ?? 0 })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <RecipeBuilder
                key={`${isRecipeBuilderOpen}-${editingRecipe?.id ?? 'new'}`}
                open={isRecipeBuilderOpen}
                onClose={handleRecipeBuilderClose}
                initialData={editingRecipe ?? undefined}
                onSaveSuccess={() => {
                    setEditingRecipe(null)
                    setRecipeBuilderError('')
                    fetchRecipes()
                    setActiveTab('recipes')
                }}
            />
        </>
    )
}

export default Products