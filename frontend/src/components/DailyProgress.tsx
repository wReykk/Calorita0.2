type TargetMacros = {
    dailyCalories: number
    dailyProtein: number
    dailyFat: number
    dailyCarbs: number
}

type ConsumedMacros = {
    calories: number
    protein: number
    fat: number
    carbs: number
}

type DailyProgressProps = {
    targetMacros: TargetMacros
    consumedMacros: ConsumedMacros
}

type MacroRowProps = {
    label: string
    consumed: number
    target: number
    unit: string
    isOver: boolean
}

function MacroRow({ label, consumed, target, unit, isOver }: MacroRowProps) {
    const safeTarget = target > 0 ? target : 1
    const percent = Math.min(100, Math.round((consumed / safeTarget) * 100))
    const barColor = isOver ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className={`font-semibold ${isOver ? 'text-amber-600' : 'text-slate-600'}`}>
                    {consumed} / {target} {unit}
                </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.max(2, percent)}%` }}
                />
            </div>

            <div className="text-xs text-slate-500">{percent}% of target</div>
        </div>
    )
}

function DailyProgress({ targetMacros, consumedMacros }: DailyProgressProps) {
    const caloriesTarget = targetMacros.dailyCalories
    const caloriesConsumed = consumedMacros.calories
    const caloriesPercent = Math.min(100, Math.round((caloriesConsumed / Math.max(1, caloriesTarget)) * 100))
    const caloriesOver = caloriesConsumed > caloriesTarget
    const caloriesRemaining = Math.max(caloriesTarget - caloriesConsumed, 0)

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Your nutrition goals</h2>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Check your daily progress</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm font-medium ${caloriesOver ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {caloriesOver ? 'Over target' : 'On track'}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-center text-sm font-semibold text-white shadow-inner">
                            <div>
                                <div className="text-2xl">{caloriesPercent}%</div>
                                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">done</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 ml-4">
                            <p className="text-sm font-medium text-slate-600">Calories</p>
                            <p className="text-xl font-semibold text-slate-900">
                                {(caloriesConsumed).toFixed(0)} / {caloriesTarget} kcal
                            </p>
                            <p className={`mt-1 text-sm font-medium ${caloriesOver ? 'text-amber-600' : 'text-slate-600'}`}>
                                {caloriesOver ? `Over by ${Math.abs(caloriesTarget - caloriesConsumed)} kcal` : `${caloriesRemaining} kcal remaining`}
                            </p>
                        </div>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 lg:w-100 mr-5">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${caloriesOver ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'}`}
                            style={{ width: `${Math.max(4, caloriesPercent)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <MacroRow
                    label="Protein"
                    consumed={Number(Number(consumedMacros.protein).toFixed(1))}
                    target={targetMacros.dailyProtein}
                    unit="g"
                    isOver={consumedMacros.protein > targetMacros.dailyProtein}
                />
                <MacroRow
                    label="Fat"
                    consumed={Number(Number(consumedMacros.fat).toFixed(1))}
                    target={targetMacros.dailyFat}
                    unit="g"
                    isOver={consumedMacros.fat > targetMacros.dailyFat}
                />
                <MacroRow
                    label="Carbs"
                    consumed={Number(Number(consumedMacros.carbs).toFixed(1))}
                    target={targetMacros.dailyCarbs}
                    unit="g"
                    isOver={consumedMacros.carbs > targetMacros.dailyCarbs}
                />
            </div>
        </div>
    )
}

export default DailyProgress
