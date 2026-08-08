import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface WeightLog {
    id: string;
    weight: number;
    date: string;
}

interface WeightChartProps {
    logs: WeightLog[];
    targetWeight?: number | null;
}

export default function WeightChart({ logs, targetWeight }: WeightChartProps) {
    const { t } = useTranslation();

    if (!logs || logs.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-500">
                    {t('weightChart.noData', 'No weight history yet. Update your profile to start tracking!')}
                </p>
            </div>
        );
    }

    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    // Группируем логи по дням. Если за один день было 5 изменений, останется только последнее.
    const chartData = Object.values(
        logs.reduce((acc, log) => {
            const dateKey = format(new Date(log.date), 'MMM dd');
            // Перезаписываем данные по ключу даты. Т.к. данные отсортированы по возрастанию (asc),
            // в итоге останется хронологически последняя запись за этот день.
            acc[dateKey] = {
                ...log,
                formattedDate: dateKey
            };
            return acc;
        }, {} as Record<string, WeightLog & { formattedDate: string }>)
    );
    // -------------------------

    const minWeight = Math.min(...chartData.map(l => l.weight), targetWeight || Infinity);
    const maxWeight = Math.max(...chartData.map(l => l.weight), targetWeight || -Infinity);
    const domainPadding = 2;

    return (
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-slate-900">
                    {t('weightChart.title', 'Weight Progress')}
                </h3>
                <p className="text-sm text-slate-500">
                    {t('weightChart.subtitle', 'Track your journey towards your goal')}
                </p>
            </div>

            <div className="h-72 w-full text-sm">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                        <XAxis
                            dataKey="formattedDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />

                        <YAxis
                            domain={[minWeight - domainPadding, maxWeight + domainPadding]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />

                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                            itemStyle={{ color: '#0f172a', fontWeight: '600' }}
                        />

                        {targetWeight && (
                            <ReferenceLine
                                y={targetWeight}
                                stroke="#10b981"
                                strokeDasharray="4 4"
                                label={{ position: 'top', value: t('weightChart.target', 'Target'), fill: '#10b981', fontSize: 12 }}
                            />
                        )}

                        <Line
                            type="monotone"
                            dataKey="weight"
                            name={t('weightChart.weight', 'Weight (kg)')}
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#0284c7' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}