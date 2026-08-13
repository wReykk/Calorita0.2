import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../hooks/usePageTitle'
import WeightChart from '../components/WeightChart'
import ActivityStreak from '../components/ActivityStreak'
import NutritionalStats from '../components/NutritionalStats'
import WaterStats from '../components/WaterStats'
import WeightReminder from '../components/WeightReminder'
import { useDashboard } from '../hooks/useDashboard'

function Home() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    usePageTitle(t('home.pageTitle', 'Home'))

    const { isLoggedIn, userData, statsData, isLoadingData } = useDashboard()

    if (!isLoggedIn) {
        return (
            <div className="min-h-[80vh] px-4 py-8 sm:px-6 lg:px-8">
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
        <div className="min-h-[80vh] px-4 pb-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl flex flex-col gap-6 sm:gap-8">

                {userData && (
                    <WeightReminder weightLogs={userData.weightLogs || []} />
                )}

                <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 pt pb-5 text-center shadow-sm sm:px-8 sm:pt-4 sm:pb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-none">
                        {t('home.welcomeBackTitle')}
                    </h1>
                    <p className="mt-2.5 max-w-2xl text-sm text-gray-500">
                        {t('home.welcomeBackDescription')}
                    </p>
                </div>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-slate-50 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                            {t('home.dividerActions', 'QUICK ACTIONS')}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => navigate('/diary')}
                        className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{t('home.diaryLabel', 'DIARY')}</p>
                        <h2 className="mt-2 text-xl font-bold text-gray-900">{t('home.diaryCardTitle', 'Open My Diary')}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {t('home.diaryCardDescription', 'Review your daily entries and keep an eye on your nutrition totals.')}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{t('home.productsLabel', 'PRODUCTS')}</p>
                        <h2 className="mt-2 text-xl font-bold text-gray-900">{t('home.productsCardTitle', 'Manage My Collection')}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {t('home.productsCardDescription', 'Add new foods to the database so they’re available when you log your meals.')}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{t('home.profileLabel', 'SETTINGS')}</p>
                        <h2 className="mt-2 text-xl font-bold text-gray-900">{t('home.profileCardTitle', 'User Profile')}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            {t('home.profileCardDescription', 'Update your weight, goals, and personal preferences.')}
                        </p>
                    </button>

                    <div className="flex cursor-default flex-col justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-left opacity-80 transition hover:opacity-100">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">{t('home.soonLabel', 'COMING SOON')}</p>
                        <h2 className="mt-2 text-xl font-bold text-gray-400">{t('home.soonCardTitle', 'New Feature')}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-400">
                            {t('home.soonCardDescription', 'We are working on something awesome. Stay tuned!')}
                        </p>
                    </div>
                </div>

                <div className="relative mt-2 py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-slate-50 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                            {t('home.dividerWidgets', 'DASHBOARD WIDGETS')}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-6">
                        <NutritionalStats stats={statsData} />
                    </div>

                    <div className="flex min-w-0 flex-col gap-6">
                        <ActivityStreak
                            currentStreak={userData?.currentStreak}
                            longestStreak={userData?.longestStreak}
                        />
                        {statsData && (
                            <WaterStats
                                weeklyAverage={statsData.weekly.water}
                                monthlyAverage={statsData.monthly.water}
                            />
                        )}
                    </div>
                </div>

                <div>
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