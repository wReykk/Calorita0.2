import { useTranslation } from 'react-i18next'
import type { UserSettingsFormProps } from '../types/userSettings.types'
import { useUserSettings } from '../hooks/useUserSettings'

function UserSettingsForm({ isOnboarding = false, onSubmitSuccess, submitLabel }: UserSettingsFormProps) {
    const { t } = useTranslation()

    const {
        state: {
            form,
            isSaving,
            feedback,
            lastUpdated,
            isMaintainGoal,
            targetWeightValidationError,
            isSubmitDisabled
        },
        actions: {
            handleChange,
            handleSubmit
        }
    } = useUserSettings({ isOnboarding, onSubmitSuccess })

    const defaultSubmitLabel = submitLabel || t('userSettings.saveSettings', 'Save settings')
    const lastUpdatedText = lastUpdated ? t('userSettings.lastUpdated', 'Last updated: {{date}}', { date: lastUpdated }) : null

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {isOnboarding ? t('userSettings.completeProfile', 'Complete your profile') : t('userSettings.updateMetrics', 'Update your body metrics')}
                </h2>
                <p className="my-5 text-sm leading-6 text-slate-600">
                    {isOnboarding
                        ? t('userSettings.onboardingDescription', 'Fill in your measurements and goals so Calorita can personalize your plan.')
                        : t('userSettings.profileDescription', 'Add your current measurements and goals so Calorita can tailor your daily nutrition plan.')}
                </p>
                {lastUpdatedText ? (
                    <p className="mt-5 text-sm text-gray-500">{lastUpdatedText}</p>
                ) : null}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="height">
                            {t('userSettings.height', 'Height (cm)')}
                        </label>
                        <input
                            id="height"
                            type="number"
                            min="1"
                            value={form.height}
                            onChange={handleChange('height')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="weight">
                            {t('userSettings.weight', 'Weight (kg)')}
                        </label>
                        <input
                            id="weight"
                            type="number"
                            min="1"
                            step="0.1"
                            value={form.weight}
                            onChange={handleChange('weight')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="dateOfBirth">
                            {t('userSettings.dateOfBirth', 'Date of Birth')}
                        </label>
                        <input
                            id="dateOfBirth"
                            type="date"
                            value={form.dateOfBirth}
                            onChange={handleChange('dateOfBirth')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="sex">
                            {t('userSettings.sex', 'Sex')}
                        </label>
                        <select
                            id="sex"
                            value={form.sex}
                            onChange={handleChange('sex')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        >
                            <option value="MALE">{t('userSettings.sexMale', 'MALE')}</option>
                            <option value="FEMALE">{t('userSettings.sexFemale', 'FEMALE')}</option>
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="activityLevel">
                            {t('userSettings.activityLevel', 'Activity Level')}
                        </label>
                        <select
                            id="activityLevel"
                            value={form.activityLevel}
                            onChange={handleChange('activityLevel')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        >
                            <option value="SEDENTARY">{t('userSettings.activitySedentary', 'SEDENTARY')}</option>
                            <option value="LIGHT">{t('userSettings.activityLight', 'LIGHT')}</option>
                            <option value="MODERATE">{t('userSettings.activityModerate', 'MODERATE')}</option>
                            <option value="ACTIVE">{t('userSettings.activityActive', 'ACTIVE')}</option>
                            <option value="VERY_ACTIVE">{t('userSettings.activityVeryActive', 'VERY ACTIVE')}</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="goal">
                            {t('userSettings.goal', 'Goal')}
                        </label>
                        <select
                            id="goal"
                            value={form.goal}
                            onChange={handleChange('goal')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            required
                        >
                            <option value="LOSE">{t('userSettings.goalLose', 'LOSE')}</option>
                            <option value="MAINTAIN">{t('userSettings.goalMaintain', 'MAINTAIN')}</option>
                            <option value="GAIN">{t('userSettings.goalGain', 'GAIN')}</option>
                        </select>
                    </div>
                </div>

                {!isMaintainGoal ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="targetWeight">
                                {t('userSettings.targetWeight', 'Target Weight (kg)')}
                            </label>
                            <input
                                id="targetWeight"
                                type="number"
                                min="1"
                                value={form.targetWeight}
                                onChange={handleChange('targetWeight')}
                                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${targetWeightValidationError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-300'}`}
                                required={!isMaintainGoal}
                            />
                            {targetWeightValidationError ? (
                                <p className="mt-2 text-sm text-red-600">{targetWeightValidationError}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="pace">
                                {t('userSettings.pace', 'Pace')}
                            </label>
                            <select
                                id="pace"
                                value={form.pace}
                                onChange={handleChange('pace')}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                required={!isMaintainGoal}
                            >
                                <option value="EASY">{t('userSettings.paceEasy', 'EASY')}</option>
                                <option value="MEDIUM">{t('userSettings.paceMedium', 'MEDIUM')}</option>
                                <option value="HARD">{t('userSettings.paceHard', 'HARD')}</option>
                            </select>
                        </div>
                    </div>
                ) : null}

                {feedback ? (
                    <div className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-600 text-white' : 'border-red-200 bg-red-600 text-white'}`}>
                        {feedback.message}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSaving ? t('userSettings.saving', 'Saving...') : defaultSubmitLabel}
                </button>
            </form>
        </div>
    )
}

export default UserSettingsForm