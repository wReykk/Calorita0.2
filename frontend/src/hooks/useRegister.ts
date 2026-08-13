import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '../services/auth.service'
import { validateName, validatePassword } from '../utils/validation.utils'

export const useRegister = () => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [nameError, setNameError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [globalError, setGlobalError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setNameError('')
        setPasswordError('')
        setGlobalError('')

        const nameValidationResult = validateName(name)
        const passwordValidationResult = validatePassword(password)

        let hasErrors = false

        if (nameValidationResult === 'short') {
            setNameError(t('register.errorNameShort', 'Username must be at least 3 characters.'))
            hasErrors = true
        } else if (nameValidationResult === 'long') {
            setNameError(t('register.errorNameLong', 'Username cannot exceed 30 characters.'))
            hasErrors = true
        } else if (nameValidationResult === 'invalid') {
            setNameError(t('register.errorNameInvalid', 'Username contains invalid characters (e.g., @, !, #).'))
            hasErrors = true
        }

        if (passwordValidationResult === 'short') {
            setPasswordError(t('register.errorPasswordShort', 'Password must be at least 8 characters.'))
            hasErrors = true
        } else if (passwordValidationResult === 'spaces') {
            setPasswordError(t('register.errorPasswordSpaces', 'Password cannot contain spaces.'))
            hasErrors = true
        }

        if (hasErrors) return

        setIsLoading(true)
        try {
            await authService.register({ name: name.trim(), email: email.trim(), password })
            const loginData = await authService.login({ email: email.trim(), password })

            if (loginData?.token) {
                localStorage.setItem('token', loginData.token)
            }
        } catch {
            setGlobalError(t('register.errorServer', 'Registration failed. Please try again.'))
        } finally {
            setIsLoading(false)
        }
    }

    return {
        state: { name, email, password, nameError, passwordError, globalError, isLoading },
        actions: { setName, setEmail, setPassword, handleSubmit }
    }
}