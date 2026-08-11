import { useTranslation } from 'react-i18next';

interface ActivityStreakProps {
    currentStreak?: number;
    longestStreak?: number;
}

export default function ActivityStreak({ currentStreak = 0, longestStreak = 0 }: ActivityStreakProps) {
    const { t } = useTranslation();

    return (
        <div className="flex h-full flex-col justify-between rounded-3xl border border-orange-200 bg-linear-to-b from-orange-50 to-white p-6 shadow-sm">
            <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                    {t('ActivityStreak.subtitle', 'Keep it up!')}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    {t('ActivityStreak.title', 'Activity Streak')}
                </h2>
            </div>

            <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl shadow-inner">
                    🔥
                </div>
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-orange-500">{currentStreak}</span>
                        <span className="text-sm font-medium text-slate-500">
                            {t('ActivityStreak.days', 'days')}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {t('ActivityStreak.best', 'Best:')} <span className="font-semibold text-slate-700">{longestStreak}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}