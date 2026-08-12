import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../hooks/usePageTitle.js'
import apiClient from '../assets/api/client'
import WeightChart from '../components/WeightChart.js'
import ActivityStreak from '../components/ActivityStreak'
import NutritionalStats from '../components/NutritionalStats'
import WaterStats from '../components/WaterStats'
import WeightReminder from '../components/WeightReminder'

interface UserChartData {
    targetWeight?: number | null;
    currentStreak?: number;
    longestStreak?: number;
    weightLogs: {
        id: string;
        weight: number;
        date: string;
    }[];
}

interface DashboardStats {
    weekly: { calories: number; protein: number; fat: number; carbs: number; water: number; };
    monthly: { calories: number; protein: number; fat: number; carbs: number; water: number; };
}

function Home() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const isLoggedIn = Boolean(localStorage.getItem('token'))
    usePageTitle(t('home.pageTitle', 'Home'))

    const [userData, setUserData] = useState<UserChartData | null>(null)
    const [statsData, setStatsData] = useState<DashboardStats | null>(null)
    const [isLoadingData, setIsLoadingData] = useState(false)

    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchUserData = async () => {
            setIsLoadingData(true)
            try {
                const response = await apiClient.get('/users/me')
                setUserData(response.data.user)
                setStatsData(response.data.stats)
            } catch (error) {
                console.error('Failed to fetch user data for chart:', error)
            } finally {
                setIsLoadingData(false)
            }
        }

        void fetchUserData()
    }, [isLoggedIn])

    if (!isLoggedIn) {
        return (
            <div className="min-h-[80vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-5xl items-center justify-center">
                    <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-10 shadow-sm sm:p-14">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">Calorita</p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                            {t('home.title')}
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
                            {t('home.description')}
                        </p>
                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                {t('home.cta')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {userData && (
                    <WeightReminder weightLogs={userData.weightLogs || []} />
                )}
                <div className="mb-2 text-center">
                    <h1 className="text-1xl font-semibold tracking-tight text-gray-900 sm:text-1xl">
                        {t('home.welcomeBackTitle')}
                    </h1>
                    <p className="mx-auto max-w-4xl text-sm leading-6 text-gray-600 text-center">
                        {t('home.welcomeBackDescription')}
                    </p>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-6">
                        <ActivityStreak
                            currentStreak={userData?.currentStreak}
                            longestStreak={userData?.longestStreak}
                        />

                        <button
                            type="button"
                            onClick={() => navigate('/diary')}
                            className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{t('home.diaryLabel')}</p>
                            <h2 className="mt-2 text-xl font-semibold text-gray-900">{t('home.diaryCardTitle')}</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                {t('home.diaryCardDescription')}
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{t('home.productsLabel')}</p>
                            <h2 className="mt-2 text-xl font-semibold text-gray-900">{t('home.productsCardTitle')}</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                {t('home.productsCardDescription')}
                            </p>
                        </button>
                    </div>

                    <div className="flex min-w-0 flex-col gap-6">
                        <NutritionalStats stats={statsData} />
                        {statsData && (
                            <div className="flex-1">
                                <WaterStats
                                    weeklyAverage={statsData.weekly.water}
                                    monthlyAverage={statsData.monthly.water}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    {isLoadingData ? (
                        <div className="flex h-72 w-full items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
                            <p className="text-sm text-gray-500">{t('common.loading', 'Loading...')}</p>
                        </div>
                    ) : (
                        <WeightChart
                            logs={userData?.weightLogs || []}
                            targetWeight={userData?.targetWeight}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home