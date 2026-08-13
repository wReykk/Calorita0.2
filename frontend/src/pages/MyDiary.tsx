import { useTranslation } from 'react-i18next'
import DailyProgress from '../components/DailyProgress'
import { usePageTitle } from '../hooks/usePageTitle'
import WaterTracker from '../components/WaterTracker'
import { useDiary } from '../hooks/useDiary'
import { getConsumedNutrition } from '../utils/diary.utils'

function MyDiary() {
    const { t } = useTranslation()
    usePageTitle(t('myDiary.pageTitle', 'Diary'))

    const {
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
    } = useDiary()

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm sm:px-8 sm:py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold leading-none text-gray-900">{t('myDiary.title')}</h1>
                        <p className="mt-1.5 text-sm text-gray-500">{t('myDiary.subtitle')}</p>
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
                                {t('myDiary.backToToday', 'Back to Today')}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                        <div className="min-w-0 lg:col-span-2">
                            <DailyProgress targetMacros={targetMacros} consumedMacros={consumedMacros} />
                        </div>

                        <div className="min-w-0 lg:col-span-1">
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
                                                { title: t('myDiary.myProducts', 'My Products'), items: myProducts },
                                                { title: t('myDiary.globalDatabase', 'Global Database'), items: globalProducts },
                                            ]

                                            return sections.flatMap((section, sectionIndex) => {
                                                if (section.items.length === 0) return []

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
            </div>
        </div>
    )
}

export default MyDiary