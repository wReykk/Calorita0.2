import axios from 'axios';
import { translateText } from './translation.service.js';

let accessToken = '';
let tokenExpiration = 0;

async function getAccessToken(): Promise<string> {
    const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
    const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

    if (accessToken && Date.now() < tokenExpiration) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET are required in .env');
    }

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        const response = await axios.post(
            'https://oauth.fatsecret.com/connect/token',
            'grant_type=client_credentials&scope=basic',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        accessToken = response.data.access_token;
        tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;
        return accessToken;
    } catch (error: any) {
        throw error;
    }
}

export async function searchProductsInFatSecret(query: string, userLang: string = 'uk') {
    let searchQuery = query;

    if (userLang === 'uk') {
        const translatedQuery = await translateText(query, 'en-US');
        searchQuery = (Array.isArray(translatedQuery) ? translatedQuery[0] : translatedQuery) || query;
    }

    let token = await getAccessToken();
    let response;

    try {
        response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                method: 'foods.search',
                search_expression: searchQuery,
                format: 'json',
                max_results: 15
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error: any) {
        return [];
    }

    if (response.data?.error) {
        if (response.data.error.code === 5 || response.data.error.message?.toLowerCase().includes('token')) {
            accessToken = '';
            tokenExpiration = 0;

            token = await getAccessToken();
            response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
                params: { method: 'foods.search', search_expression: searchQuery, format: 'json', max_results: 15 },
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } else {
            return [];
        }
    }

    const foods = response.data?.foods?.food;

    if (!foods) {
        return [];
    }

    const foodArray = Array.isArray(foods) ? foods : [foods];

    let translatedNames: string[] = [];

    if (userLang === 'uk') {
        const foodNames = foodArray.map((food: any) => food.food_name);
        const translationResult = await translateText(foodNames, 'uk');
        translatedNames = Array.isArray(translationResult) ? translationResult : [translationResult];
    }

    return foodArray.map((food: any, index: number) => {
        const desc = food.food_description || '';

        const getMacro = (regex: RegExp) => {
            const match = desc.match(regex);
            return match ? parseFloat(match[1]) : 0;
        };

        let pieceName: string | undefined = undefined;
        const portionMatch = desc.match(/^Per\s+(.*?)\s+-/i);

        if (portionMatch) {
            const portion = portionMatch[1].toLowerCase().trim();
            if (!portion.includes('100g') && !portion.includes('100 g') &&
                !portion.includes('100ml') && !portion.includes('100 ml')) {
                pieceName = portion;
            }
        }

        const finalName = userLang === 'uk' && translatedNames[index]
            ? translatedNames[index]
            : food.food_name;

        return {
            id: food.food_id,
            externalId: food.food_id,
            name: finalName,
            calories: getMacro(/Calories:\s*([\d.]+)kcal/i),
            protein: getMacro(/Protein:\s*([\d.]+)g/i),
            fat: getMacro(/Fat:\s*([\d.]+)g/i),
            carbs: getMacro(/Carbs:\s*([\d.]+)g/i),
            description: desc,
            pieceName: pieceName,
            isGlobal: true
        };
    });
}