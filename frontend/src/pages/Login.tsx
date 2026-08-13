import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLogin } from '../hooks/useLogin'

function Login() {
    const { t } = useTranslation()
    usePageTitle(t('login.pageTitle', 'Sign In'))

    const {
        state: { email, password, error, isLoading },
        actions: { setEmail, setPassword, handleSubmit }
    } = useLogin()

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Calorita</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                        {t('login.title', 'Sign In')}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                        {t('login.subtitle', 'Welcome back, please sign in to your account')}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('login.email', 'Email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('login.password', 'Password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-500"
                            required
                        />
                    </div>

                    {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? t('common.loading', 'Loading...') : t('login.submit', 'Sign In')}
                    </button>

                    {/* Ссылка на регистрацию */}
                    <div className="mt-6 text-center text-sm text-slate-500">
                        {t('login.dontHaveAccount', "Don't have an account yet?")}
                        {' '}
                        <Link to="/register" className="font-semibold text-slate-900 hover:underline">
                            {t('login.signUpLink', 'Sign Up')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login