import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../services/auth.service'

export const useLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        try {
            const data = await authService.login({ email, password })

            if (data?.token) {
                localStorage.setItem('token', data.token)

                if (data?.user?.id) {
                    localStorage.setItem('userId', data.user.id)
                    localStorage.setItem('user', JSON.stringify(data.user))
                } else {
                    localStorage.removeItem('userId')
                    localStorage.removeItem('user')
                }

                const savedUsername =
                    data?.user?.name ||
                    data?.user?.email ||
                    data?.name ||
                    data?.email ||
                    data?.username ||
                    ''

                if (savedUsername) {
                    localStorage.setItem('username', savedUsername)
                } else {
                    localStorage.removeItem('username')
                }

                navigate('/')
            }
        } catch {
            setError(t('login.error'))
        }
    }

    return {
        state: {
            email,
            password,
            error
        },
        actions: {
            setEmail,
            setPassword,
            handleSubmit
        }
    }
}