import { useTranslation } from 'react-i18next';

interface WaterStatsProps {
    weeklyAverage?: number;
    monthlyAverage?: number; // Можно даже удалить этот пропс, если он больше нигде не нужен
}

export default function WaterStats({ weeklyAverage = 0 }: WaterStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="flex h-full w-full flex-col justify-between rounded-3xl border border-blue-100 bg-linear-to-b from-blue-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-500 shadow-inner">
                    💧
                </div>
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
                        {t('stats.waterAvg', 'Avg Intake')}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">
                        {weeklyAverage} <span className="text-sm font-medium text-slate-500">{t('waterStats.mlPerDay', 'ml / day')}</span>
                    </h3>
                </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-blue-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('stats.monthly', '30 Days')}
                </p>
                {/* Заменили цифры на красивую цитату */}
                <p className="text-xs font-medium italic text-slate-400">
                    {t('stats.waterQuote', 'Water is the source of life')}
                </p>
            </div>
        </div>
    );
}