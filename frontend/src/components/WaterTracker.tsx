import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../assets/api/client';

// 1. Описываем пропсы: виджет теперь ждет дату снаружи
interface WaterTrackerProps {
    selectedDate?: Date | string;
}

// 2. Принимаем selectedDate
export default function WaterTracker({ selectedDate }: WaterTrackerProps) {
    const { t } = useTranslation();
    const [waterTotal, setWaterTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // 3. Форматируем дату для бэкенда (или берем сегодняшнюю по умолчанию)
    const activeDate = selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString();

    const DAILY_GOAL = 2000;
    const progressPercentage = Math.min((waterTotal / DAILY_GOAL) * 100, 100);

    useEffect(() => {
        const fetchWater = async () => {
            try {
                // 4. Передаем дату в запросе
                const response = await apiClient.get(`/water/today?date=${activeDate}`);
                setWaterTotal(response.data.total);
            } catch (error) {
                console.error('Failed to fetch water:', error);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchWater();
    }, [activeDate]); // 5. Перезагружаем данные, когда дата меняется!

    const handleAddWater = async (amount: number) => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            setWaterTotal(prev => prev + amount);
            // 6. Передаем дату при добавлении
            await apiClient.post('/water', { amount, date: activeDate });
        } catch (error) {
            console.error('Failed to add water:', error);
            setWaterTotal(prev => prev - amount);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveWater = async (amount: number) => {
        if (isProcessing || waterTotal === 0) return;
        setIsProcessing(true);

        const amountToRemove = Math.min(amount, waterTotal);

        try {
            setWaterTotal(prev => prev - amountToRemove);
            // 7. Передаем дату при удалении
            await apiClient.delete(`/water/${amountToRemove}?date=${activeDate}`);
        } catch (error) {
            console.error('Failed to remove water:', error);
            setWaterTotal(prev => prev + amountToRemove);
        } finally {
            setIsProcessing(false);
        }
    };

    // ... остальной код рендера остается без изменений

    if (isLoading) {
        return (
            <div className="flex h-full w-full min-h-62.5 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <p className="text-sm text-slate-500">{t('common.loading', 'Loading...')}</p>
            </div>
        );
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

            {/* Сетка кнопок (добавление и удаление) */}
            <div className="grid grid-cols-3 gap-3">
                {/* Ряд добавления */}
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

                {/* Ряд удаления (более бледный/красный дизайн) */}
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
    );
}