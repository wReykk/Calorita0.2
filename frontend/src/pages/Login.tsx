import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLogin } from '../hooks/useLogin'

function Login() {
    const { t } = useTranslation()
    usePageTitle(t('home.pageTitle', 'Log In'))

    const {
        state: { email, password, error },
        actions: { setEmail, setPassword, handleSubmit }
    } = useLogin()

    return (
        <div className="min-h-[80vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Calorita</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                            {t('login.title')}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                            {t('login.subtitle')}
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('login.email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('login.password')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        {error ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            {t('login.submit')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login