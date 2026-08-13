import { useNavigate } from 'react-router-dom'

export const useOnboarding = () => {
    const navigate = useNavigate()

    const handleOnboardingSuccess = () => {
        const storedUser = localStorage.getItem('user')

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                const refreshedUser = {
                    ...parsedUser,
                    weight: parsedUser.weight ?? null,
                    height: parsedUser.height ?? null,
                    goal: parsedUser.goal ?? null,
                }
                localStorage.setItem('user', JSON.stringify(refreshedUser))
            } catch {
                console.error('Failed to parse user data from localStorage.')
            }
        }

        navigate('/', { replace: true })
    }

    return {
        actions: {
            handleOnboardingSuccess
        }
    }
}