export interface UserChartData {
    targetWeight?: number | null;
    currentStreak?: number;
    longestStreak?: number;
    weightLogs: {
        id: string;
        weight: number;
        date: string;
    }[];
}

export interface DashboardStats {
    weekly: { calories: number; protein: number; fat: number; carbs: number; water: number; };
    monthly: { calories: number; protein: number; fat: number; carbs: number; water: number; };
}