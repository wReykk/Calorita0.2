import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../assets/api/client';

export default function WaterTracker() {
    const { t } = useTranslation();
    const [waterTotal, setWaterTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const DAILY_GOAL = 2000;
    const progressPercentage = Math.min((waterTotal / DAILY_GOAL) * 100, 100);

    useEffect(() => {
        const fetchWater = async () => {
            try {
                const response = await apiClient.get('/water/today');
                setWaterTotal(response.data.total);
            } catch (error) {
                console.error('Failed to fetch water:', error);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchWater();
    }, []);

    const handleAddWater = async (amount: number) => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            setWaterTotal(prev => prev + amount);
            await apiClient.post('/water', { amount });
        } catch (error) {
            console.error('Failed to add water:', error);
            setWaterTotal(prev => prev - amount);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveWater = async (amount: number) => {
        if (isProcessing || waterTotal < amount) return;
        setIsProcessing(true);

        try {
            // Оптимистичное удаление
            setWaterTotal(prev => Math.max(0, prev - amount));
            // Отправляем DELETE запрос (в URL передаем объем)
            await apiClient.delete(`/water/${amount}`);
        } catch (error) {
            console.error('Failed to remove water:', error);
            // Если на сервере не нашлось такой записи, возвращаем воду обратно
            setWaterTotal(prev => prev + amount);
        } finally {
            setIsProcessing(false);
        }
    };

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
                <div className="mb-6 flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                        {t('waterTracker.title', 'Water Intake')}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {t('waterTracker.subtitle', 'Stay hydrated throughout the day')}
                    </p>
                </div>

                <div className="mb-4 flex items-end justify-between">
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

                <div className="mb-6 h-4 w-full overflow-hidden rounded-full bg-slate-100">
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
                    disabled={isProcessing || waterTotal < 250}
                    className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                >
                    <span className="text-xs font-semibold">-250</span>
                </button>
                <button
                    onClick={() => handleRemoveWater(330)}
                    disabled={isProcessing || waterTotal < 330}
                    className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                >
                    <span className="text-xs font-semibold">-330</span>
                </button>
                <button
                    onClick={() => handleRemoveWater(500)}
                    disabled={isProcessing || waterTotal < 500}
                    className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                >
                    <span className="text-xs font-semibold">-500</span>
                </button>
            </div>
        </div>
    );
}