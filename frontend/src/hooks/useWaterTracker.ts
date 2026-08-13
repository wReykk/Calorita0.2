import { useState, useEffect } from 'react'
import { waterService } from '../services/water.service'

interface UseWaterTrackerProps {
    selectedDate?: Date | string;
}

export const useWaterTracker = ({ selectedDate }: UseWaterTrackerProps) => {
    const [waterTotal, setWaterTotal] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    const activeDate = selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString()

    const DAILY_GOAL = 2000
    const progressPercentage = Math.min((waterTotal / DAILY_GOAL) * 100, 100)

    useEffect(() => {
        const fetchWater = async () => {
            setIsLoading(true)
            try {
                const data = await waterService.getDailyWater(activeDate)
                setWaterTotal(data.total)
            } catch (error) {
                console.error('Failed to fetch water:', error)
            } finally {
                setIsLoading(false)
            }
        }

        void fetchWater()
    }, [activeDate])

    const handleAddWater = async (amount: number) => {
        if (isProcessing) return
        setIsProcessing(true)

        try {
            // Оптимистичное обновление UI
            setWaterTotal(prev => prev + amount)
            await waterService.addWater({ amount, date: activeDate })
        } catch (error) {
            console.error('Failed to add water:', error)
            // Откат изменений при ошибке
            setWaterTotal(prev => prev - amount)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleRemoveWater = async (amount: number) => {
        if (isProcessing || waterTotal === 0) return
        setIsProcessing(true)

        const amountToRemove = Math.min(amount, waterTotal)

        try {
            // Оптимистичное обновление UI
            setWaterTotal(prev => prev - amountToRemove)
            await waterService.removeWater(amountToRemove, activeDate)
        } catch (error) {
            console.error('Failed to remove water:', error)
            // Откат изменений при ошибке
            setWaterTotal(prev => prev + amountToRemove)
        } finally {
            setIsProcessing(false)
        }
    }

    return {
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
    }
}