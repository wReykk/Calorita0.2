import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRegister } from '../hooks/useRegister'

function Register() {
    const { t } = useTranslation()
    usePageTitle(t('home.pageTitle', 'Register'))

    const {
        state: { name, email, password, error, successMessage },
        actions: { setName, setEmail, setPassword, handleSubmit }
    } = useRegister()

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Calorita</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                        {t('register.title')}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                        {t('register.subtitle')}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{t('register.name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{t('register.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{t('register.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    {successMessage ? <p className="text-sm text-emerald-600 my-3">{successMessage}</p> : null}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 mt-3 font-medium text-white transition hover:bg-slate-700"
                    >
                        {t('register.submit')}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Register