import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface WeightReminderProps {
    weightLogs: { date: string }[];
}

export default function WeightReminder({ weightLogs }: WeightReminderProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const checkNeedsUpdate = () => {
        if (!weightLogs || weightLogs.length === 0) return false;

        const latestLog = weightLogs.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date) ? current : latest;
        });

        const today = new Date();
        const lastLogDate = new Date(latestLog.date);

        const diffTime = today.getTime() - lastLogDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        return diffDays >= 7;
    };

    if (!checkNeedsUpdate()) {
        return null;
    }

    return (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-3xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl shadow-inner">
                    ⚖️
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-indigo-900">
                        {t('reminder.weightTitle', 'Time for a weigh-in!')}
                    </h4>
                    <p className="mt-0.5 text-sm text-indigo-700">
                        {t('reminder.weightDesc', 'It’s been a week since your last update. Keep your stats accurate.')}
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate('/profile')}
                className="shrink-0 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
            >
                {t('reminder.updateBtn', 'Update weight')}
            </button>
        </div>
    );
}