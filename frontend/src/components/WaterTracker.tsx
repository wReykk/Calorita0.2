import { useTranslation } from 'react-i18next'
import { useWaterTracker } from '../hooks/useWaterTracker'

interface WaterTrackerProps {
    selectedDate?: Date | string;
}

export default function WaterTracker({ selectedDate }: WaterTrackerProps) {
    const { t } = useTranslation()

    const {
        state: {
            waterTotal,
            isLoading,
            isProcessing,
            progressPercentage,
            DAILY_GOAL
        },
        actions: {
            handleAddWater,
            handleRemoveWater
        }
    } = useWaterTracker({ selectedDate })

    if (isLoading) {
        return (
            <div className="flex h-full w-full min-h-62.5 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <p className="text-sm text-slate-500">{t('common.loading', 'Loading...')}</p>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col justify-between w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <div className="mb-8">
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                        {t('waterTracker.title', 'Water Intake')}
                    </h2>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {t('waterTracker.subtitle', 'Stay hydrated throughout the day')}
                    </p>
                </div>

                <div className="my-4 flex items-end justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-blue-500">{waterTotal}</span>
                        <span className="text-sm font-medium text-slate-500">/ {DAILY_GOAL} ml</span>
                    </div>
                    {waterTotal >= DAILY_GOAL && (
                        <span className="text-sm font-semibold text-green-500">
                            {t('waterTracker.goalReached', 'Goal reached! 🎉')}
                        </span>
                    )}
                </div>

                <div className="mb-8 mt-5 h-4 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => handleAddWater(250)}
                    disabled={isProcessing}
                    className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 py-3 text-blue-600 transition hover:bg-blue-100 active:scale-95 disabled:opacity-50"
                >
                    <span className="text-lg">💧</span>
                    <span className="mt-1 text-sm font-semibold">+250</span>
                </button>
                <button
                    onClick={() => handleAddWater(330)}
                    disabled={isProcessing}
                    className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 py-3 text-blue-600 transition hover:bg-blue-100 active:scale-95 disabled:opacity-50"
                >
                    <span className="text-lg">🥤</span>
                    <span className="mt-1 text-sm font-semibold">+330</span>
                </button>
                <button
                    onClick={() => handleAddWater(500)}
                    disabled={isProcessing}
                    className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 py-3 text-blue-600 transition hover:bg-blue-100 active:scale-95 disabled:opacity-50"
                >
                    <span className="text-lg">🫙</span>
                    <span className="mt-1 text-sm font-semibold">+500</span>
                </button>

                <button
                    onClick={() => handleRemoveWater(250)}
                    disabled={isProcessing || waterTotal === 0}
                    className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                >
                    <span className="text-xs font-semibold">-250</span>
                </button>
                <button
                    onClick={() => handleRemoveWater(330)}
                    disabled={isProcessing || waterTotal === 0}
                    className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                >
                    <span className="text-xs font-semibold">-330</span>
                </button>
                <button
                    onClick={() => handleRemoveWater(500)}
                    disabled={isProcessing || waterTotal === 0}
                    className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                >
                    <span className="text-xs font-semibold">-500</span>
                </button>
            </div>
        </div>
    )
}