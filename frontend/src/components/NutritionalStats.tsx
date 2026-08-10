import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Экспортируем тип, чтобы потом переиспользовать его в Home.tsx
export interface NutritionalStatsData {
    weekly: { calories: number; protein: number; fat: number; carbs: number; };
    monthly: { calories: number; protein: number; fat: number; carbs: number; };
}

interface NutritionalStatsProps {
    stats?: NutritionalStatsData | null;
}

export default function NutritionalStats({ stats }: NutritionalStatsProps) {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

    // Если данные еще не загрузились, показываем заглушку
    if (!stats) {
        return (
            <div className="flex h-full min-h-75 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">{t('common.loading', 'Loading...')}</p>
            </div>
        );
    }

    const currentData = stats[period];

    return (
        <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <div className="mb-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {t('stats.subtitle', 'Averages')}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                        {t('stats.title', 'Nutrition Stats')}
                    </h2>
                </div>

                {/* Переключатель Неделя/Месяц */}
                <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-all ${period === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {t('stats.weekly', '7 Days')}
                    </button>
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-all ${period === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {t('stats.monthly', '30 Days')}
                    </button>
                </div>
            </div>

            {/* Сетка с показателями (БЖУ и Калории) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('common.calories', 'Calories')}
                    </span>
                    <span className="mt-1 text-xl font-bold text-slate-900">
                        {currentData.calories} <span className="text-sm font-medium text-slate-500">kcal</span>
                    </span>
                </div>
                <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('common.protein', 'Protein')}
                    </span>
                    <span className="mt-1 text-xl font-bold text-slate-900">
                        {currentData.protein} <span className="text-sm font-medium text-slate-500">g</span>
                    </span>
                </div>
                <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('common.fat', 'Fat')}
                    </span>
                    <span className="mt-1 text-xl font-bold text-slate-900">
                        {currentData.fat} <span className="text-sm font-medium text-slate-500">g</span>
                    </span>
                </div>
                <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('common.carbs', 'Carbs')}
                    </span>
                    <span className="mt-1 text-xl font-bold text-slate-900">
                        {currentData.carbs} <span className="text-sm font-medium text-slate-500">g</span>
                    </span>
                </div>
            </div>
        </div>
    );
}