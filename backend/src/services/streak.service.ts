import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkAndUpdateStreak = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true, lastActiveDate: true }
    });

    if (!user) throw new Error('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
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