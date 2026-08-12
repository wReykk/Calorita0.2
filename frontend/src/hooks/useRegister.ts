import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../assets/api/client'

export const useRegister = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const navigate = useNavigate()
    const { t } = useTranslation()

    const persistAuthState = (token: string, user: Record<string, unknown>) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        if (user.id) {
            localStorage.setItem('userId', String(user.id))
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSuccessMessage('')

        try {
            const registerResponse = await apiClient.post('/auth/register', { name, email, password })
            const registerData = registerResponse.data

            if (registerData?.token) {
                persistAuthState(registerData.token, registerData)
            } else {
                const loginResponse = await apiClient.post('/auth/login', { email, password })
                const loginData = loginResponse.data
                const user = loginData?.user
                const token = loginData?.token

                if (token && user) {
                    persistAuthState(token, user)
                } else {
                    throw new Error('Unable to authenticate user after registration')
                }
            }

            setSuccessMessage('User registered successfully! Redirecting...')

            window.setTimeout(() => {
                navigate('/onboarding', { replace: true })
            }, 2000)
        } catch {
            setError(t('register.error'))
        }
    }

    return {
        state: {
            name,
            email,
            password,
            error,
            successMessage
        },
        actions: {
            setName,
            setEmail,
            setPassword,
            handleSubmit
        }
    }
}