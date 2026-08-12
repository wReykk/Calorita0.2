import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../hooks/usePageTitle'
import RecipeBuilder from '../components/RecipeBuilder'
import { useCollection, emptyForm } from '../hooks/useCollection'
import type { Recipe } from '../types/recipe.types'

function Products() {
    const { t } = useTranslation()
    usePageTitle(t('home.pageTitle', 'My Collection'))

    const {
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
    } = useCollection()

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('products.title')}</h1>
                        <p className="text-sm text-slate-600">{t('products.subtitle')}</p>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500 mt-5 mb-2">{t('products.tipValue')}</h3>
                        <p className="text-sm text-slate-600 mb-3">{t('products.tip')}</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('products')}
                            className={`w-full rounded-3xl px-5 py-3 text-sm font-semibold transition ${activeTab === 'products' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            {t('products.myProducts', 'My Products')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('recipes')}
                            className={`w-full rounded-3xl px-5 py-3 text-sm font-semibold transition ${activeTab === 'recipes' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            {t('products.myRecipes', 'My Recipes')}
                        </button>
                    </div>
                </div>

                {activeTab === 'recipes' ? (
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
                                                            void handleEditRecipe(String(recipe.id))
                                                        }}
                                                        className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        {t('products.edit')}
                                                    </button>
                                                </div>

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
                    <div className="space-y-6">
                        <form onSubmit={handleProductSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                                                        onClick={() => startEditProduct(product)}
                                                        className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        {t('products.edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => void handleDeleteProduct(product.id)}
                                                        className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        {t('products.delete')}
                                                    </button>
                                                </div>
                                            </div>

                                            {editState.productId === product.id ? (
                                                <form onSubmit={handleEditProductSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
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
                    handleRecipeBuilderClose();
                    void fetchRecipes()
                    setActiveTab('recipes')
                }}
            />
        </>
    )
}

export default Products