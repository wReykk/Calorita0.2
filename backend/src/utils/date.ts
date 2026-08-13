export const getUTCToday = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
};

export const getUTCEndOfDay = (date: Date) => {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
};

export const getDayBounds = (dateParam?: string) => {
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const startOfDay = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        0, 0, 0, 0
    ));

    const tomorrow = new Date(startOfDay.getTime());
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    return { startOfDay, tomorrow };
};

export const calculateAge = (dob: string | Date): number => {
    const diffMs = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};