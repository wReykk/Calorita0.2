import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../assets/api/client'

function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        try {
            const response = await apiClient.post('/auth/register', { name, email, password })

            if (response.data?.token) {
                localStorage.setItem('token', response.data.token)
                navigate('/')
            }
        } catch {
            setError('Registration failed. Please try again.')
        }
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-semibold">Create your account</h1>
                <p className="mb-6 text-sm text-slate-600">Start your journey with Calorita.</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700"
                    >
                        Create account
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Register
