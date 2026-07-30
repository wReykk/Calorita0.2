import { useNavigate } from 'react-router-dom'
import UserSettingsForm from '../components/UserSettingsForm'

function UserProfile() {
    const navigate = useNavigate()

    return (
        <div className="min-h-[80vh] bg-gray-50 px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
                <div className="flex items-start justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        ← Back
                    </button>

                    <div className="text-right">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Profile</p>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your settings</h1>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-4xl">
                    <UserSettingsForm />
                </div>
            </div>
        </div>
    )
}

export default UserProfile