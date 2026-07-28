import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import MyDiary from './pages/MyDiary'
import Products from './pages/Products'
import Register from './pages/Register'

function Layout() {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const username = localStorage.getItem('username') || ''

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 w-full font-sans">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Calorita
          </Link>

          <div className="flex items-center gap-4 text-sm font-medium">
            {isLoggedIn ? (
              <>
                <Link to="/" className="text-slate-600 transition hover:text-slate-900">
                  Home
                </Link>
                <Link to="/diary" className="text-slate-600 transition hover:text-slate-900">
                  My Diary
                </Link>
                <Link to="/products" className="text-slate-600 transition hover:text-slate-900">
                  Products
                </Link>
                <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {username ? `Hi, ${username}` : 'Logged in'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 transition hover:text-slate-900">
                  Login
                </Link>
                <Link to="/register" className="text-slate-600 transition hover:text-slate-900">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/products" element={<Products />} />
            <Route path="/diary" element={<MyDiary />} />
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
