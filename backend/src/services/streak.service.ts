import { prisma } from '../prisma/prisma.config.js';

export const checkAndUpdateStreak = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true, lastActiveDate: true }
    });

    if (!user) throw new Error('User not found');

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

    let lastActive = null;
    if (user.lastActiveDate) {
        const la = new Date(user.lastActiveDate);
        lastActive = new Date(Date.UTC(la.getUTCFullYear(), la.getUTCMonth(), la.getUTCDate(), 0, 0, 0, 0));
    }

    let newStreak = user.currentStreak;
    let newLongest = user.longestStreak;
    let isUpdated = false;

    if (!lastActive) {
        newStreak = 1;
        newLongest = 1;
        isUpdated = true;
    } else {
        const diffTime = today.getTime() - lastActive.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak += 1;
            if (newStreak > newLongest) {
                newLongest = newStreak;
            }
            isUpdated = true;
        } else if (diffDays > 1) {
            newStreak = 1;
            isUpdated = true;
        }
    }

    if (isUpdated) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastActiveDate: today
            }
        });
    }

    return {
        currentStreak: newStreak,
        longestStreak: newLongest
    };
};