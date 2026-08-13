import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useRegister } from '../hooks/useRegister'

function Register() {
    const { t } = useTranslation()
    usePageTitle(t('register.pageTitle', 'Sign Up'))

    const {
        state: { name, email, password, nameError, passwordError, globalError, isLoading },
        actions: { setName, setEmail, setPassword, handleSubmit }
    } = useRegister()

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Calorita</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                        {t('register.title', 'Sign Up')}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                        {t('register.subtitle', 'Create your account to get started')}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('register.name', 'Username')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 outline-none ring-0 transition ${nameError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'
                                }`}
                            required
                        />
                        {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            {t('register.email', 'Email')}
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
                            {t('register.password', 'Password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 outline-none ring-0 transition ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'
                                }`}
                            required
                        />
                        {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
                    </div>

                    {globalError && <p className="text-sm font-medium text-red-600">{globalError}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? t('common.loading', 'Loading...') : t('register.submit', 'Sign Up')}
                    </button>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {t('register.alreadyHaveAccount', 'Already have an account?')}
                        {' '}
                        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                            {t('register.signInLink', 'Sign In')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register