import { useNavigate } from 'react-router-dom'
import UserSettingsForm from '../components/UserSettingsForm'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useTranslation } from 'react-i18next'

function Onboarding() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    usePageTitle(t('onboarding.pageTitle', 'Onboarding'))

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {t('onboarding.title', 'Welcome to Calorita')}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                    {t(
                        'onboarding.description',
                        'Before you can continue, please complete your profile so we can tailor your nutrition plan.'
                    )}
                </p>
            </div>

            <UserSettingsForm
                isOnboarding
                submitLabel={t('onboarding.completeButton', 'Complete onboarding')}
                onSubmitSuccess={() => {
                    const storedUser = localStorage.getItem('user')

                    if (storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser)
                            const refreshedUser = {
                                ...parsedUser,
                                weight: parsedUser.weight ?? null,
                                height: parsedUser.height ?? null,
                                goal: parsedUser.goal ?? null,
                            }
                            localStorage.setItem('user', JSON.stringify(refreshedUser))
                        } catch {
                            console.error('Failed to parse user data from localStorage.')
                        }
                    }

                    navigate('/', { replace: true })
                }}
            />
        </div>
    )
}



export default Onboarding
