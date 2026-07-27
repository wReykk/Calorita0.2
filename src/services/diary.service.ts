import { prisma } from '../prisma/prisma.config.js';

export class DiaryService {

    public async addEntry(userId: string, data: { productId: string; amount: number; date?: string }) {
        return await prisma.diaryEntry.create({
            data: {
                userId,
                productId: data.productId,
                amount: data.amount,
                ...(data.date && { date: new Date(data.date) })
            },
            include: {
                product: true
            }
        });
    }

    public async getEntries(userId: string) {
        return await prisma.diaryEntry.findMany({
            where: { userId },
            include: {
                product: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }

    public async deleteEntry(id: string, userId: string) {
        await prisma.diaryEntry.delete({
            where: { id, userId }
        });
    }
}