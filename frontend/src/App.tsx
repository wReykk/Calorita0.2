import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import MyDiary from './pages/MyDiary'
import Onboarding from './pages/Onboarding'
import Products from './pages/MyCollection'
import Register from './pages/Register'
import UserProfile from './pages/UserProfile'
import i18n from './i18n'

function Layout() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const username = localStorage.getItem('username') || ''
  const currentLanguage = i18n.language || 'en'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 w-full font-sans">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Calorita
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`rounded-full px-2 py-1 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 ${currentLanguage === 'en' ? 'bg-slate-900 text-white shadow-sm' : 'bg-transparent'}`}
              >
                {t('navbar.languageEnglish')}
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('uk')}
                className={`rounded-full px-2 py-1 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 ${currentLanguage === 'uk' ? 'bg-slate-900 text-white shadow-sm' : 'bg-transparent'}`}
              >
                {t('navbar.languageUkrainian')}
              </button>
            </div>

            {isLoggedIn ? (
              <>
                <Link to="/" className="text-slate-600 transition hover:text-slate-900">
                  {t('navbar.home')}
                </Link>
                <Link to="/diary" className="text-slate-600 transition hover:text-slate-900">
                  {t('navbar.myDiary')}
                </Link>
                <Link to="/products" className="text-slate-600 transition hover:text-slate-900">
                  {t('navbar.products')}
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 transition hover:bg-emerald-100"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {username ? t('navbar.hi', { name: username }) : t('navbar.loggedIn')}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50"
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 transition hover:text-slate-900">
                  {t('navbar.login')}
                </Link>
                <Link to="/register" className="text-slate-600 transition hover:text-slate-900">
                  {t('navbar.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/products" element={<Products />} />
            <Route path="/diary" element={<MyDiary />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
