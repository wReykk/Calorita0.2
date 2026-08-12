import { useTranslation } from 'react-i18next'
import type { RecipeDetails } from '../services/recipe.service'
import { useRecipeBuilder } from '../hooks/useRecipeBuilder'

type RecipeBuilderProps = {
    open: boolean
    onClose: () => void
    onSaveSuccess: () => void
    initialData?: RecipeDetails
}

function RecipeBuilder({ open, onClose, onSaveSuccess, initialData }: RecipeBuilderProps) {
    const { t } = useTranslation()

    const {
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
    } = useRecipeBuilder({ open, onClose, onSaveSuccess, initialData })

    if (!open) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40" onClick={handleClose} />
            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-4xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">{initialData ? t('recipeBuilder.titleEdit', 'Edit Recipe') : t('recipeBuilder.title', 'Recipe Builder')}</h2>
                        <p className="text-sm text-slate-600">{initialData ? t('recipeBuilder.subtitleEdit', 'Update the recipe details and ingredients.') : t('recipeBuilder.subtitle', 'Add ingredients and save a new recipe.')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        {t('recipeBuilder.close', 'Close')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">{t('recipeBuilder.name', 'Recipe Name')}</label>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                                placeholder={t('recipeBuilder.namePlaceholder', 'e.g. Chicken Stir Fry')}
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">{t('recipeBuilder.totalWeight', 'Cooked Weight (g)')}</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={totalWeight}
                                onChange={(event) => setTotalWeight(event.target.value)}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                                placeholder={t('recipeBuilder.totalWeightPlaceholder', 'e.g. 500')}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('recipeBuilder.productSearch', 'Search Products')}</label>
                        <div className="relative">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => {
                                    const query = event.target.value
                                    setSearchQuery(query)
                                    const isActive = query.trim().length >= 2
                                    setIsDropdownOpen(isActive)

                                    if (!isActive) {
                                        setSearchResults([])
                                    }
                                }}
                                placeholder={t('recipeBuilder.productSearchPlaceholder', 'Search local products or global database')}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                            />

                            {isDropdownOpen && searchResults.length > 0 && (
                                <ul className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                                    {(() => {
                                        const myProducts = searchResults.filter((product) => product.isGlobal === false)
                                        const globalProducts = searchResults.filter((product) => product.isGlobal === true)
                                        const sections = [
                                            { title: t('recipeBuilder.myProducts', 'My Products'), items: myProducts },
                                            { title: t('recipeBuilder.globalProducts', 'Global Database'), items: globalProducts },
                                        ]

                                        return sections.flatMap((section, sectionIndex) => {
                                            if (section.items.length === 0) {
                                                return []
                                            }

                                            return [
                                                <li key={`${section.title}-header`} className="border-b border-slate-100 bg-slate-50 px-3 py-2">
                                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{section.title}</span>
                                                </li>,
                                                ...section.items.map((product) => (
                                                    <li key={product.id}>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(event) => {
                                                                event.preventDefault()
                                                                handleSelectProduct(product)
                                                            }}
                                                            className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50"
                                                        >
                                                            <span className="font-medium">{product.name}</span>
                                                            <span className="text-xs text-slate-500">
                                                                {Math.round(product.calories ?? 0)} kcal • {product.protein ?? 0}g P • {product.fat ?? 0}g F • {product.carbs ?? 0}g C
                                                            </span>
                                                        </button>
                                                    </li>
                                                )),
                                                sectionIndex < sections.length - 1 ? <li key={`${section.title}-divider`} className="border-t border-slate-100" /> : null,
                                            ]
                                        })
                                    })()}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900">{t('recipeBuilder.ingredientsTitle', 'Ingredients')}</h3>
                            <span className="text-sm text-slate-500">{ingredients.length} {t('recipeBuilder.ingredientsCount', 'items')}</span>
                        </div>

                        {ingredients.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                                {t('recipeBuilder.emptyIngredients', 'Select products to add them to the recipe.')}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ingredients.map((ingredient) => (
                                    <div key={ingredient.productId} className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[1.4fr_0.8fr_auto] md:items-center">
                                        <div>
                                            <p className="font-medium text-slate-900">{ingredient.name}</p>
                                            <p className="text-xs text-slate-500">{ingredient.pieceName ? t('recipeBuilder.piece', 'piece') : t('recipeBuilder.per100g', 'per 100g')}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{ingredient.pieceName ? t('recipeBuilder.quantity', 'Quantity') : t('recipeBuilder.amountGram', 'Amount (g)')}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="ingredient.pieceName ? 1 : 1"
                                                value={ingredient.amount}
                                                onChange={(event) => handleAmountChange(ingredient.productId, event.target.value)}
                                                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveIngredient(ingredient.productId)}
                                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                        >
                                            {t('recipeBuilder.remove', 'Remove')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {initialData?.id ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                            >
                                {t('recipeBuilder.delete', 'Delete Recipe')}
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                {t('recipeBuilder.cancel', 'Cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? t('recipeBuilder.saving', 'Saving...') : t('recipeBuilder.save', 'Save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RecipeBuilder