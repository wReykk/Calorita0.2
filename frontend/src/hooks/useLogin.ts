import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'

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
            const response = await apiClient.post('/auth/login', { email, password })

            if (response.data?.token) {
                localStorage.setItem('token', response.data.token)

                if (response.data?.user?.id) {
                    localStorage.setItem('userId', response.data.user.id)
                    localStorage.setItem('user', JSON.stringify(response.data.user))
                } else {
                    localStorage.removeItem('userId')
                    localStorage.removeItem('user')
                }

                const savedUsername =
                    response.data?.user?.name ||
                    response.data?.user?.email ||
                    response.data?.name ||
                    response.data?.email ||
                    response.data?.username ||
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